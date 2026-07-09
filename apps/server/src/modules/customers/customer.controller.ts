/**
 * Customer Controller
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const CUSTOMER_SELECT = {
  id: true,
  companyName: true,
  phone: true,
  gstNumber: true,
  remarks: true,
  isActive: true,
  createdAt: true,
  user: { select: { id: true, email: true, name: true, isActive: true } },
  addresses: true,
};

export async function listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const search = (req.query['search'] as string) ?? '';

    const where = search
      ? {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' as const } },
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.customerProfile.findMany({
        where,
        select: CUSTOMER_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customerProfile.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Customers fetched',
      data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customer = await prisma.customerProfile.findUnique({
      where: { id: req.params['id'] as string },
      select: CUSTOMER_SELECT,
    });
    if (!customer) throw new AppError(404, 'Customer not found');
    res.json({ success: true, message: 'Customer fetched', data: customer });
  } catch (error) {
    next(error);
  }
}

export async function createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, phone, companyName, gstNumber, remarks, billingAddress, shippingAddress } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError(409, 'Email already registered');

    const hashedPw = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPw,
        role: UserRole.CUSTOMER,
        customer: {
          create: {
            phone,
            companyName,
            gstNumber,
            remarks,
            addresses: {
              create: [
                { ...billingAddress, type: 'BILLING', isDefault: true },
                { ...shippingAddress, type: 'SHIPPING', isDefault: true },
              ],
            },
          },
        },
      },
      include: {
        customer: { include: { addresses: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Customer created', data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone, companyName, gstNumber, remarks } = req.body;

    const customer = await prisma.customerProfile.findUnique({ where: { id: req.params['id'] as string } });
    if (!customer) throw new AppError(404, 'Customer not found');

    await prisma.$transaction([
      prisma.customerProfile.update({
        where: { id: req.params['id'] as string },
        data: { phone, companyName, gstNumber, remarks },
      }),
      prisma.user.update({
        where: { id: customer.userId },
        data: { name },
      }),
    ]);

    res.json({ success: true, message: 'Customer updated' });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customer = await prisma.customerProfile.findUnique({ where: { id: req.params['id'] as string } });
    if (!customer) throw new AppError(404, 'Customer not found');
    // Cascade deletes customer profile + addresses + pricing
    await prisma.user.delete({ where: { id: customer.userId } });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
}

export async function toggleActivation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isActive } = req.body as { isActive: boolean };
    const customer = await prisma.customerProfile.findUnique({ where: { id: req.params['id'] as string } });
    if (!customer) throw new AppError(404, 'Customer not found');

    await prisma.$transaction([
      prisma.customerProfile.update({ where: { id: req.params['id'] as string }, data: { isActive } }),
      prisma.user.update({ where: { id: customer.userId }, data: { isActive } }),
    ]);

    res.json({ success: true, message: `Customer ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { newPassword } = req.body as { newPassword: string };
    const customer = await prisma.customerProfile.findUnique({ where: { id: req.params['id'] as string } });
    if (!customer) throw new AppError(404, 'Customer not found');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: customer.userId }, data: { password: hashed } });
    // Invalidate all sessions
    await prisma.refreshToken.deleteMany({ where: { userId: customer.userId } });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}
