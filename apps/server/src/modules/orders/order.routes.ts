import { Router } from 'express';
import { body, param, query, checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './order.controller';

const router = Router();
router.use(authenticate);

// Customer: create order, view own orders
// Admin: view all orders, update status
router.get(
  '/',
  checkExact([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PACKED', 'DELIVERED', 'CANCELLED']).withMessage('Invalid order status'),
    query('customerId').optional().isString().isLength({ min: 1, max: 64 }).withMessage('Invalid customer ID'),
    query('dateFrom').optional().isISO8601().withMessage('dateFrom must be a valid ISO8601 date'),
    query('dateTo').optional().isISO8601().withMessage('dateTo must be a valid ISO8601 date'),
  ], { locations: ['query', 'body', 'params'] }),
  validateRequest,
  ctrl.listOrders
);

router.get(
  '/:id',
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid order ID format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.getOrder
);

router.post(
  '/',
  checkExact([
    body('items')
      .isArray({ min: 1, max: 200 })
      .withMessage('Items must be an array of 1 to 200 products'),
    body('items.*.productId')
      .isString()
      .withMessage('Product ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid product ID length'),
    body('items.*.quantity')
      .isInt({ min: 1, max: 1000000 })
      .withMessage('Quantity must be an integer between 1 and 1,000,000'),
    body('specialInstructions')
      .optional({ nullable: true })
      .isString()
      .withMessage('Special instructions must be a string')
      .isLength({ max: 1000 })
      .withMessage('Special instructions cannot exceed 1000 characters'),
    body('preferredDeliveryDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Preferred delivery date must be a valid ISO8601 date string'),
  ]),
  validateRequest,
  ctrl.createOrder
);

router.patch(
  '/:id/status',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid order ID format'),
    body('status')
      .isString()
      .withMessage('Status must be a string')
      .isIn(['PENDING', 'CONFIRMED', 'PACKED', 'DELIVERED', 'CANCELLED'])
      .withMessage('Status must be one of PENDING, CONFIRMED, PACKED, DELIVERED, CANCELLED'),
  ]),
  validateRequest,
  ctrl.updateOrderStatus
);

export default router;
