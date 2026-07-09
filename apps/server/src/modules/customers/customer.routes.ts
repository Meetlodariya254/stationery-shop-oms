/**
 * Customer Routes — Admin CRUD + toggle activation + reset password
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './customer.controller';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', requireAdmin, ctrl.listCustomers);

router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('billingAddress').isObject().withMessage('Billing address is required'),
    body('shippingAddress').isObject().withMessage('Shipping address is required'),
  ],
  validateRequest,
  ctrl.createCustomer
);

router.get('/:id', requireAdmin, param('id').notEmpty(), validateRequest, ctrl.getCustomer);

router.put(
  '/:id',
  requireAdmin,
  [param('id').notEmpty(), body('companyName').optional().trim().notEmpty()],
  validateRequest,
  ctrl.updateCustomer
);

router.delete('/:id', requireAdmin, param('id').notEmpty(), validateRequest, ctrl.deleteCustomer);

router.patch(
  '/:id/activate',
  requireAdmin,
  [param('id').notEmpty(), body('isActive').isBoolean()],
  validateRequest,
  ctrl.toggleActivation
);

router.post(
  '/:id/reset-password',
  requireAdmin,
  [
    param('id').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validateRequest,
  ctrl.resetPassword
);

export default router;
