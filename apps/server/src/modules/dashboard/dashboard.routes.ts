import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import * as ctrl from './dashboard.controller';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/stats', ctrl.getDashboardStats);
export default router;
