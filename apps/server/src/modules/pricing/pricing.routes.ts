import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './pricing.controller';

const router = Router();
router.use(authenticate, requireAdmin);

// Get all prices for a specific customer
router.get('/customer/:customerId', ctrl.getCustomerPrices);

// Get prices for a specific product across all customers
router.get('/product/:productId', ctrl.getProductPrices);

// Set a single price
router.post(
  '/',
  [
    body('customerId').notEmpty(),
    body('productId').notEmpty(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validateRequest,
  ctrl.setPrice
);

// Bulk set prices for a customer
router.post(
  '/bulk',
  [
    body('customerId').notEmpty(),
    body('prices').isArray({ min: 1 }),
    body('prices.*.productId').notEmpty(),
    body('prices.*.price').isFloat({ min: 0 }),
  ],
  validateRequest,
  ctrl.bulkSetPrices
);

// Delete a specific price
router.delete('/customer/:customerId/product/:productId', ctrl.deletePrice);

export default router;
