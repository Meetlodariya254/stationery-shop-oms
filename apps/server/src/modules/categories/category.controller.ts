import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, message: 'Categories fetched', data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await prisma.category.update({ where: { id: req.params['id'] as string }, data: req.body });
    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productCount = await prisma.product.count({ where: { categoryId: req.params['id'] as string } });
    if (productCount > 0) throw new AppError(400, `Cannot delete category with ${productCount} products`);
    await prisma.category.delete({ where: { id: req.params['id'] as string } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}
