import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import * as ctrl from './settings.controller';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/', ctrl.getSettings);
router.put('/', ctrl.updateSettings);
export default router;
