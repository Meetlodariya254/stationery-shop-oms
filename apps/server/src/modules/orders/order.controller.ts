/**
 * Order Controller
 * Creates orders with customer-specific pricing snapshot; sends email notification.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { sendOrderConfirmationEmail } from '../../lib/email';
import { UserRole } from '@prisma/client';

function generateOrderNumber(): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${yy}${mm}${dd}-${rand}`;
}

const ORDER_INCLUDE = {
  customer: {
    select: {
      id: true,
      companyName: true,
      phone: true,
      gstNumber: true,
      user: { select: { name: true, email: true } },
    },
  },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true, imageUrl: true } },
    },
  },
};

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const status = req.query['status'] as string | undefined;
    const customerId = req.query['customerId'] as string | undefined;
    const dateFrom = req.query['dateFrom'] as string | undefined;
    const dateTo = req.query['dateTo'] as string | undefined;

    let where: Record<string, unknown> = {};

    // Customers can only see their own orders
    if (req.user?.role === UserRole.CUSTOMER) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user.userId } });
      if (!customer) throw new AppError(404, 'Customer profile not found');
      where['customerId'] = customer.id;
    } else {
      if (customerId) where['customerId'] = customerId;
    }

    if (status) where['status'] = status;
    if (dateFrom || dateTo) {
      where['createdAt'] = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Orders fetched',
      data: { items: orders, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params['id'] as string },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new AppError(404, 'Order not found');

    // Customers can only see their own orders
    if (req.user?.role === UserRole.CUSTOMER) {
      const customer = await prisma.customerProfile.findUnique({ where: { userId: req.user.userId } });
      if (!customer || order.customerId !== customer.id) {
        throw new AppError(403, 'Access denied');
      }
    }

    res.json({ success: true, message: 'Order fetched', data: order });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user?.role !== UserRole.CUSTOMER) {
      throw new AppError(403, 'Only customers can place orders');
    }

    const { items, specialInstructions, preferredDeliveryDate } = req.body as {
      items: Array<{ productId: string; quantity: number }>;
      specialInstructions?: string;
      preferredDeliveryDate?: string;
    };

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: true,
        addresses: { where: { isDefault: true } },
      },
    });
    if (!customer) throw new AppError(404, 'Customer profile not found');
    if (!customer.isActive) throw new AppError(403, 'Your account is currently deactivated');

    // Validate items and get customer-specific prices
    const orderItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      productName: string;
      sku: string;
    }> = [];

    for (const item of items) {
      const priceRecord = await prisma.customerPrice.findUnique({
        where: { customerId_productId: { customerId: customer.id, productId: item.productId } },
        include: { product: true },
      });

      if (!priceRecord) {
        throw new AppError(400, `Product ${item.productId} is not available in your price list`);
      }

      const unitPrice = parseFloat(priceRecord.price.toString());
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        productName: priceRecord.product.name,
        sku: priceRecord.product.sku,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const grandTotal = subtotal; // Future: add taxes/discounts

    const billingAddr = customer.addresses.find((a) => a.type === 'BILLING');
    const shippingAddr = customer.addresses.find((a) => a.type === 'SHIPPING');

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        status: 'PENDING',
        subtotal,
        grandTotal,
        billingAddressId: billingAddr?.id ?? null,
        shippingAddressId: shippingAddr?.id ?? null,
        ...(billingAddr ? { billingAddressSnapshot: { ...billingAddr } } : {}),
        ...(shippingAddr ? { shippingAddressSnapshot: { ...shippingAddr } } : {}),
        ...(specialInstructions ? { specialInstructions } : {}),
        ...(preferredDeliveryDate ? { preferredDeliveryDate: new Date(preferredDeliveryDate) } : {}),
        items: {
          create: orderItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });

    // Send email notification asynchronously (non-blocking)
    const addr = [billingAddr?.street, billingAddr?.city, billingAddr?.state, billingAddr?.pincode]
      .filter(Boolean)
      .join(', ');

    void sendOrderConfirmationEmail({
      customerName: customer.user.name,
      companyName: customer.companyName,
      phone: customer.phone,
      email: customer.user.email,
      address: addr,
      orderNumber: order.orderNumber,
      orderDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      ...(customer.gstNumber ? { gstNumber: customer.gstNumber } : {}),
      items: orderItems.map((i) => ({
        productName: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      subtotal,
      grandTotal,
      ...(specialInstructions ? { specialInstructions } : {}),
      ...(preferredDeliveryDate
        ? { preferredDeliveryDate: new Date(preferredDeliveryDate).toLocaleDateString('en-IN') }
        : {}),
    }).then(() =>
      prisma.order.update({ where: { id: order.id }, data: { emailSentAt: new Date() } })
    );

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body as { status: string };
    const order = await prisma.order.update({
      where: { id: req.params['id'] as string },
      data: { status: status as never },
      include: ORDER_INCLUDE,
    });
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
}
