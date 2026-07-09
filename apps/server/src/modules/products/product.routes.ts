/**
 * Product Routes
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './product.controller';

const router = Router();
router.use(authenticate);

// Admin: full CRUD. Customers: read-only with their prices.
router.get('/', ctrl.listProducts);
router.get('/:id', param('id').notEmpty(), validateRequest, ctrl.getProduct);

router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().notEmpty(),
    body('sku').trim().notEmpty(),
    body('unit').trim().notEmpty(),
    body('categoryId').notEmpty(),
    body('stockQuantity').isInt({ min: 0 }),
  ],
  validateRequest,
  ctrl.createProduct
);

router.put('/:id', requireAdmin, validateRequest, ctrl.updateProduct);
router.delete('/:id', requireAdmin, param('id').notEmpty(), validateRequest, ctrl.deleteProduct);

export default router;
