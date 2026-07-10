import { Router } from 'express';
import { body, checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './settings.controller';

const router = Router();
router.use(authenticate, requireAdmin);

router.get(
  '/',
  checkExact([], { locations: ['query', 'body', 'params'] }),
  validateRequest,
  ctrl.getSettings
);

router.put(
  '/',
  [
    body().isObject().withMessage('Settings body must be a valid JSON object'),
    body('*')
      .isString()
      .withMessage('Setting values must be strings')
      .isLength({ min: 0, max: 5000 })
      .withMessage('Setting values cannot exceed 5000 characters'),
  ],
  validateRequest,
  ctrl.updateSettings
);

export default router;
