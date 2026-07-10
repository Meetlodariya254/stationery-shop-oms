import { Router } from 'express';
import { body, param, checkExact } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import * as ctrl from './category.controller';

const router = Router();
router.use(authenticate);

router.get('/', checkExact([], { locations: ['body', 'query'] }), validateRequest, ctrl.listCategories);

router.post(
  '/',
  requireAdmin,
  checkExact([
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('description')
      .optional({ nullable: true })
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ]),
  validateRequest,
  ctrl.createCategory
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
    body('description')
      .optional({ nullable: true })
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ]),
  validateRequest,
  ctrl.updateCategory
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
  ctrl.deleteCategory
);

export default router;
