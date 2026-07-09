import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import * as ctrl from './report.controller';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/sales', ctrl.getSalesReport);
router.get('/customers', ctrl.getCustomerReport);
router.get('/products', ctrl.getProductReport);

export default router;
