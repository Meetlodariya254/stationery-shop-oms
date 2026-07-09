import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './category.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.listCategories);
router.post('/', requireAdmin, [body('name').trim().notEmpty()], validateRequest, ctrl.createCategory);
router.put('/:id', requireAdmin, [param('id').notEmpty()], validateRequest, ctrl.updateCategory);
router.delete('/:id', requireAdmin, [param('id').notEmpty()], validateRequest, ctrl.deleteCategory);

export default router;
