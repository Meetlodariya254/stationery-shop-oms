import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export async function getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dateFrom = req.query['dateFrom'] ? new Date(req.query['dateFrom'] as string) : new Date(new Date().getFullYear(), 0, 1);
    const dateTo = req.query['dateTo'] ? new Date(req.query['dateTo'] as string) : new Date();

    const orders = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      _count: { id: true },
      _sum: { grandTotal: true },
    });

    const revenueOrders = await prisma.order.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo }, status: { in: ['DELIVERED', 'CONFIRMED', 'PACKED'] } },
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, message: 'Sales report fetched', data: { summary: orders, orders: revenueOrders } });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerReport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customers = await prisma.customerProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        orders: { select: { grandTotal: true, status: true } },
      },
    });

    const report = customers.map((c) => ({
      customerId: c.id,
      companyName: c.companyName,
      name: c.user.name,
      email: c.user.email,
      totalOrders: c.orders.length,
      totalRevenue: c.orders.reduce((sum, o) => sum + parseFloat(o.grandTotal.toString()), 0),
    }));

    res.json({ success: true, message: 'Customer report fetched', data: report });
  } catch (error) {
    next(error);
  }
}

export async function getProductReport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalPrice: true },
      _count: { id: true },
    });

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const report = items.map((i) => ({
      productId: i.productId,
      productName: productMap.get(i.productId)?.name ?? 'Unknown',
      sku: productMap.get(i.productId)?.sku ?? '',
      totalQuantitySold: i._sum.quantity ?? 0,
      totalRevenue: parseFloat((i._sum.totalPrice ?? 0).toString()),
    }));

    res.json({ success: true, message: 'Product report fetched', data: report });
  } catch (error) {
    next(error);
  }
}
