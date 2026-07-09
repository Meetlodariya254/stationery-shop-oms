import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './order.controller';

const router = Router();
router.use(authenticate);

// Customer: create order, view own orders
// Admin: view all orders, update status
router.get('/', ctrl.listOrders);
router.get('/:id', param('id').notEmpty(), validateRequest, ctrl.getOrder);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  ctrl.createOrder
);

router.patch(
  '/:id/status',
  requireAdmin,
  [
    param('id').notEmpty(),
    body('status').isIn(['PENDING', 'CONFIRMED', 'PACKED', 'DELIVERED', 'CANCELLED']),
  ],
  validateRequest,
  ctrl.updateOrderStatus
);

export default router;
