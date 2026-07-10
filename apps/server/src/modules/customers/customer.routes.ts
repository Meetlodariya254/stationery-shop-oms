/**
 * Customer Routes — Admin CRUD + toggle activation + reset password
 */

import { Router } from 'express';
import { body, param, query, checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './customer.controller';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Admin-only routes
router.get(
  '/',
  requireAdmin,
  checkExact([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
    query('search').optional().isString().isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
  ], { locations: ['query', 'body', 'params'] }),
  validateRequest,
  ctrl.listCustomers
);

router.post(
  '/',
  requireAdmin,
  checkExact([
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('email')
      .isString()
      .withMessage('Email must be a string')
      .isLength({ min: 5, max: 255 })
      .withMessage('Email must be between 5 and 255 characters')
      .isEmail()
      .withMessage('Valid email format is required'),
    body('password')
      .isString()
      .withMessage('Password must be a string')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters'),
    body('phone')
      .isString()
      .withMessage('Phone must be a string')
      .isLength({ min: 5, max: 30 })
      .withMessage('Phone must be between 5 and 30 characters'),
    body('companyName')
      .isString()
      .withMessage('Company name must be a string')
      .isLength({ min: 1, max: 150 })
      .withMessage('Company name must be between 1 and 150 characters'),
    body('gstNumber')
      .optional({ nullable: true })
      .isString()
      .withMessage('GST number must be a string')
      .isLength({ max: 30 })
      .withMessage('GST number cannot exceed 30 characters'),
    body('remarks')
      .optional({ nullable: true })
      .isString()
      .withMessage('Remarks must be a string')
      .isLength({ max: 500 })
      .withMessage('Remarks cannot exceed 500 characters'),
    body('billingAddress')
      .isObject()
      .withMessage('Billing address must be a valid JSON object'),
    body('billingAddress.street')
      .isString()
      .withMessage('Billing street must be a string')
      .isLength({ min: 1, max: 200 })
      .withMessage('Billing street must be between 1 and 200 characters'),
    body('billingAddress.city')
      .isString()
      .withMessage('Billing city must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Billing city must be between 1 and 100 characters'),
    body('billingAddress.state')
      .isString()
      .withMessage('Billing state must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Billing state must be between 1 and 100 characters'),
    body('billingAddress.pincode')
      .isString()
      .withMessage('Billing pincode must be a string')
      .isLength({ min: 1, max: 20 })
      .withMessage('Billing pincode must be between 1 and 20 characters'),
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address must be a valid JSON object'),
    body('shippingAddress.street')
      .isString()
      .withMessage('Shipping street must be a string')
      .isLength({ min: 1, max: 200 })
      .withMessage('Shipping street must be between 1 and 200 characters'),
    body('shippingAddress.city')
      .isString()
      .withMessage('Shipping city must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Shipping city must be between 1 and 100 characters'),
    body('shippingAddress.state')
      .isString()
      .withMessage('Shipping state must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Shipping state must be between 1 and 100 characters'),
    body('shippingAddress.pincode')
      .isString()
      .withMessage('Shipping pincode must be a string')
      .isLength({ min: 1, max: 20 })
      .withMessage('Shipping pincode must be between 1 and 20 characters'),
  ]),
  validateRequest,
  ctrl.createCustomer
);

router.get(
  '/:id',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID length or format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.getCustomer
);

router.put(
  '/:id',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID length or format'),
    body('name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('phone')
      .optional()
      .isString()
      .withMessage('Phone must be a string')
      .isLength({ min: 5, max: 30 })
      .withMessage('Phone must be between 5 and 30 characters'),
    body('companyName')
      .optional()
      .isString()
      .withMessage('Company name must be a string')
      .isLength({ min: 1, max: 150 })
      .withMessage('Company name must be between 1 and 150 characters'),
    body('gstNumber')
      .optional({ nullable: true })
      .isString()
      .withMessage('GST number must be a string')
      .isLength({ max: 30 })
      .withMessage('GST number cannot exceed 30 characters'),
    body('remarks')
      .optional({ nullable: true })
      .isString()
      .withMessage('Remarks must be a string')
      .isLength({ max: 500 })
      .withMessage('Remarks cannot exceed 500 characters'),
  ]),
  validateRequest,
  ctrl.updateCustomer
);

router.delete(
  '/:id',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID length or format'),
  ], { locations: ['params', 'body', 'query'] }),
  validateRequest,
  ctrl.deleteCustomer
);

router.patch(
  '/:id/activate',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID length or format'),
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ]),
  validateRequest,
  ctrl.toggleActivation
);

router.post(
  '/:id/reset-password',
  requireAdmin,
  checkExact([
    param('id')
      .isString()
      .withMessage('ID must be a string')
      .isLength({ min: 1, max: 64 })
      .withMessage('Invalid ID length or format'),
    body('newPassword')
      .isString()
      .withMessage('New password must be a string')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
  ]),
  validateRequest,
  ctrl.resetPassword
);

export default router;
