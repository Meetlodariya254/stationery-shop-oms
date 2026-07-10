import { Router } from 'express';
import { checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './dashboard.controller';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/stats', checkExact([], { locations: ['body', 'query', 'params'] }), validateRequest, ctrl.getDashboardStats);
export default router;
