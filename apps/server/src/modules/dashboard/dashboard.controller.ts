import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      todayOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      monthlySalesResult,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.customerProfile.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED', createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { grandTotal: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          grandTotal: true,
          createdAt: true,
          customer: { select: { id: true, companyName: true } },
        },
      }),
    ]);

    const monthlySales = parseFloat((monthlySalesResult._sum.grandTotal ?? 0).toString());

    res.json({
      success: true,
      message: 'Dashboard stats fetched',
      data: {
        todayOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers,
        totalProducts,
        monthlySales,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
}
