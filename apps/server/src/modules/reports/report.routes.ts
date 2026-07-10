import { Router } from 'express';
import { query, checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './report.controller';

const router = Router();
router.use(authenticate, requireAdmin);

router.get(
  '/sales',
  checkExact([
    query('dateFrom').optional().isISO8601().withMessage('dateFrom must be a valid ISO8601 date'),
    query('dateTo').optional().isISO8601().withMessage('dateTo must be a valid ISO8601 date'),
  ], { locations: ['query', 'body', 'params'] }),
  validateRequest,
  ctrl.getSalesReport
);

router.get(
  '/customers',
  checkExact([], { locations: ['query', 'body', 'params'] }),
  validateRequest,
  ctrl.getCustomerReport
);

router.get(
  '/products',
  checkExact([], { locations: ['query', 'body', 'params'] }),
  validateRequest,
  ctrl.getProductReport
);

export default router;
