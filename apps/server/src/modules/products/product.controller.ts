/**
 * Product Controller
 * For customers, products are returned with their specific custom prices.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { UserRole, ProductStatus } from '@prisma/client';

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true } },
};

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const search = (req.query['search'] as string) ?? '';
    const categoryId = req.query['categoryId'] as string | undefined;

    const where: Record<string, unknown> = {
      status: ProductStatus.ACTIVE,
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ] } : {}),
    };

    // Admin sees all products regardless of status
    if (req.user?.role === UserRole.ADMIN) {
      delete where['status'];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    // For customers: attach their specific pricing
    if (req.user?.role === UserRole.CUSTOMER) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user.userId } });
      if (!customer) throw new AppError(404, 'Customer profile not found');

      const prices = await prisma.customerPrice.findMany({
        where: { customerId: customer.id },
        select: { productId: true, price: true },
      });
      const priceMap = new Map(prices.map((p) => [p.productId, parseFloat(p.price.toString())]));

      const productsWithPrice = products
        .map((p) => ({ ...p, price: priceMap.get(p.id) ?? null }))
        .filter((p) => p.price !== null); // Only show products with assigned prices

      res.json({
        success: true,
        message: 'Products fetched',
        data: { items: productsWithPrice, total: productsWithPrice.length, page, limit, totalPages: Math.ceil(productsWithPrice.length / limit) },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Products fetched',
      data: { items: products, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params['id'] as string },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new AppError(404, 'Product not found');

    // For customers, include their price
    if (req.user?.role === UserRole.CUSTOMER) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user.userId } });
      if (!customer) throw new AppError(404, 'Customer profile not found');
      const priceRecord = await prisma.customerPrice.findUnique({
        where: { customerId_productId: { customerId: customer.id, productId: product.id } },
      });
      if (!priceRecord) throw new AppError(404, 'Product not available for your account');
      res.json({ success: true, message: 'Product fetched', data: { ...product, price: parseFloat(priceRecord.price.toString()) } });
      return;
    }

    res.json({ success: true, message: 'Product fetched', data: product });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    const product = await prisma.product.create({ data, include: PRODUCT_INCLUDE });
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.update({
      where: { id: req.params['id'] as string },
      data: req.body,
      include: PRODUCT_INCLUDE,
    });
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.product.delete({ where: { id: req.params['id'] as string } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}
