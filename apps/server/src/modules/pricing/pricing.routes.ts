import { Router } from 'express';
import { body, param, checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './pricing.controller';

const router = Router();
router.use(authenticate, requireAdmin);

// Get all prices for a specific customer
router.get(
  '/customer/:customerId',
  checkExact([
    param('customerId')
      .isString()
      .withMessage('Customer ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid customer ID length or format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.getCustomerPrices
);

// Get prices for a specific product across all customers
router.get(
  '/product/:productId',
  checkExact([
    param('productId')
      .isString()
      .withMessage('Product ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid product ID length or format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.getProductPrices
);

// Set a single price
router.post(
  '/',
  checkExact([
    body('customerId')
      .isString()
      .withMessage('Customer ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid customer ID length or format'),
    body('productId')
      .isString()
      .withMessage('Product ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid product ID length or format'),
    body('price')
      .isFloat({ min: 0, max: 1000000000 })
      .withMessage('Price must be a non-negative number up to 1,000,000,000'),
  ]),
  validateRequest,
  ctrl.setPrice
);

// Bulk set prices for a customer
router.post(
  '/bulk',
  checkExact([
    body('customerId')
      .isString()
      .withMessage('Customer ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid customer ID length or format'),
    body('prices')
      .isArray({ min: 1, max: 1000 })
      .withMessage('Prices must be an array of 1 to 1000 items'),
    body('prices.*.productId')
      .isString()
      .withMessage('Product ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid product ID length or format'),
    body('prices.*.price')
      .isFloat({ min: 0, max: 1000000000 })
      .withMessage('Price must be a non-negative number up to 1,000,000,000'),
  ]),
  validateRequest,
  ctrl.bulkSetPrices
);

// Delete a specific price
router.delete(
  '/customer/:customerId/product/:productId',
  checkExact([
    param('customerId')
      .isString()
      .withMessage('Customer ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid customer ID length or format'),
    param('productId')
      .isString()
      .withMessage('Product ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid product ID length or format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.deletePrice
);

export default router;
