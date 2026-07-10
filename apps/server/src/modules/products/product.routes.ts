/**
 * Product Routes
 */

import { Router } from 'express';
import { body, param, query, checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './product.controller';

const router = Router();
router.use(authenticate);

// Admin: full CRUD. Customers: read-only with their prices.
router.get(
  '/',
  checkExact([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
    query('categoryId').optional().isString().isLength({ min: 1, max: 64 }).withMessage('Invalid category ID'),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
  ], { locations: ['query', 'body', 'params'] }),
  validateRequest,
  ctrl.listProducts
);

router.get(
  '/:id',
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.getProduct
);

router.post(
  '/',
  requireAdmin,
  checkExact([
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 200 })
      .withMessage('Name must be between 1 and 200 characters'),
    body('description')
      .optional({ nullable: true })
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('sku')
      .isString()
      .withMessage('SKU must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('SKU must be between 1 and 100 characters'),
    body('barcode')
      .optional({ nullable: true })
      .isString()
      .withMessage('Barcode must be a string')
      .isLength({ max: 100 })
      .withMessage('Barcode cannot exceed 100 characters'),
    body('imageUrl')
      .optional({ nullable: true })
      .isString()
      .withMessage('Image URL must be a string')
      .isLength({ max: 2048 })
      .withMessage('Image URL cannot exceed 2048 characters'),
    body('unit')
      .isString()
      .withMessage('Unit must be a string')
      .isLength({ min: 1, max: 20 })
      .withMessage('Unit must be between 1 and 20 characters'),
    body('stockQuantity')
      .isInt({ min: 0, max: 10000000 })
      .withMessage('Stock quantity must be a non-negative integer'),
    body('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE'])
      .withMessage('Status must be ACTIVE or INACTIVE'),
    body('categoryId')
      .isString()
      .withMessage('Category ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid category ID'),
  ]),
  validateRequest,
  ctrl.createProduct
);

router.put(
  '/:id',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID format'),
    body('name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 200 })
      .withMessage('Name must be between 1 and 200 characters'),
    body('description')
      .optional({ nullable: true })
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('sku')
      .optional()
      .isString()
      .withMessage('SKU must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('SKU must be between 1 and 100 characters'),
    body('barcode')
      .optional({ nullable: true })
      .isString()
      .withMessage('Barcode must be a string')
      .isLength({ max: 100 })
      .withMessage('Barcode cannot exceed 100 characters'),
    body('imageUrl')
      .optional({ nullable: true })
      .isString()
      .withMessage('Image URL must be a string')
      .isLength({ max: 2048 })
      .withMessage('Image URL cannot exceed 2048 characters'),
    body('unit')
      .optional()
      .isString()
      .withMessage('Unit must be a string')
      .isLength({ min: 1, max: 20 })
      .withMessage('Unit must be between 1 and 20 characters'),
    body('stockQuantity')
      .optional()
      .isInt({ min: 0, max: 10000000 })
      .withMessage('Stock quantity must be a non-negative integer'),
    body('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE'])
      .withMessage('Status must be ACTIVE or INACTIVE'),
    body('categoryId')
      .optional()
      .isString()
      .withMessage('Category ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid category ID'),
  ]),
  validateRequest,
  ctrl.updateProduct
);

router.delete(
  '/:id',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.deleteProduct
);

export default router;
