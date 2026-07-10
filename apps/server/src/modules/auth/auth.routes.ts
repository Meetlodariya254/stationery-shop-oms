/**
 * Auth Routes
 */

import { Router } from 'express';
import { body, checkExact } from 'express-validator';
import { validateRequest } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import * as authController from './auth.controller';

const router = Router();

router.post(
  '/login',
  authLimiter,
  checkExact([
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
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters'),
  ]),
  validateRequest,
  authController.login
);

router.post(
  '/refresh',
  authLimiter,
  checkExact([
    body('refreshToken')
      .isString()
      .withMessage('Refresh token must be a string')
      .isLength({ min: 10, max: 2048 })
      .withMessage('Refresh token must be a valid JWT string'),
  ]),
  validateRequest,
  authController.refreshToken
);

router.post(
  '/logout',
  authenticate,
  checkExact([], { locations: ['body', 'query'] }),
  validateRequest,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  checkExact([], { locations: ['body', 'query'] }),
  validateRequest,
  authController.getMe
);

router.post(
  '/change-password',
  authenticate,
  checkExact([
    body('currentPassword')
      .isString()
      .withMessage('Current password must be a string')
      .isLength({ min: 1, max: 128 })
      .withMessage('Current password is required'),
    body('newPassword')
      .isString()
      .withMessage('New password must be a string')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
  ]),
  validateRequest,
  authController.changePassword
);

router.put(
  '/profile',
  authenticate,
  checkExact([
    body('name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('email')
      .optional()
      .isString()
      .withMessage('Email must be a string')
      .isLength({ min: 5, max: 255 })
      .withMessage('Email must be between 5 and 255 characters')
      .isEmail()
      .withMessage('Valid email is required'),
  ]),
  validateRequest,
  authController.updateProfile
);

router.post(
  '/forgot-password',
  authLimiter,
  checkExact([
    body('email')
      .isString()
      .withMessage('Email must be a string')
      .isLength({ min: 5, max: 255 })
      .withMessage('Email must be between 5 and 255 characters')
      .isEmail()
      .withMessage('Valid email format is required'),
  ]),
  validateRequest,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  checkExact([
    body('email')
      .isString()
      .withMessage('Email must be a string')
      .isLength({ min: 5, max: 255 })
      .withMessage('Email must be between 5 and 255 characters')
      .isEmail()
      .withMessage('Valid email format is required'),
    body('otp')
      .isString()
      .withMessage('Verification code must be a string')
      .isLength({ min: 4, max: 12 })
      .withMessage('Verification code must be between 4 and 12 characters'),
    body('newPassword')
      .isString()
      .withMessage('New password must be a string')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
  ]),
  validateRequest,
  authController.resetPassword
);

export default router;
