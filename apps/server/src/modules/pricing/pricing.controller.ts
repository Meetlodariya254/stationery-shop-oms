/**
 * Pricing Controller
 * Manages customer-specific pricing (admin only).
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function getCustomerPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.params['customerId'] as string;
    const customer = await prisma.customerProfile.findUnique({ where: { id: customerId } });
    if (!customer) throw new AppError(404, 'Customer not found');

    // Return all products with customer-specific price (null if not set)
    const allProducts = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    });
    const prices = await prisma.customerPrice.findMany({
      where: { customerId },
      select: { productId: true, price: true, id: true },
    });
    const priceMap = new Map(prices.map((p) => [p.productId, { price: parseFloat(p.price.toString()), id: p.id }]));

    const result = allProducts.map((p) => ({
      ...p,
      customerPrice: priceMap.get(p.id) ?? null,
    }));

    res.json({ success: true, message: 'Customer prices fetched', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getProductPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId = req.params['productId'] as string;
    const prices = await prisma.customerPrice.findMany({
      where: { productId },
      include: {
        customer: {
          select: { id: true, companyName: true, user: { select: { name: true, email: true } } },
        },
      },
    });
    res.json({ success: true, message: 'Product prices fetched', data: prices });
  } catch (error) {
    next(error);
  }
}

export async function setPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId, productId, price } = req.body;
    const result = await prisma.customerPrice.upsert({
      where: { customerId_productId: { customerId, productId } },
      update: { price },
      create: { customerId, productId, price },
    });
    res.json({ success: true, message: 'Price set', data: result });
  } catch (error) {
    next(error);
  }
}

export async function bulkSetPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId, prices } = req.body as {
      customerId: string;
      prices: Array<{ productId: string; price: number }>;
    };

    const results = await prisma.$transaction(
      prices.map((p) =>
        prisma.customerPrice.upsert({
          where: { customerId_productId: { customerId, productId: p.productId } },
          update: { price: p.price },
          create: { customerId, productId: p.productId, price: p.price },
        })
      )
    );

    res.json({ success: true, message: `${results.length} prices updated`, data: results });
  } catch (error) {
    next(error);
  }
}

export async function deletePrice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.params['customerId'] as string;
    const productId = req.params['productId'] as string;
    await prisma.customerPrice.delete({
      where: { customerId_productId: { customerId, productId } },
    });
    res.json({ success: true, message: 'Price deleted' });
  } catch (error) {
    next(error);
  }
}
