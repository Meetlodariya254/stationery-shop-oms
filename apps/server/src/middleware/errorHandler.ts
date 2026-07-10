/**
 * Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Operational user-facing errors thrown intentionally (e.g. AppError(404, 'Customer not found'))
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  const prismaErr = err as { code?: string; name?: string; message?: string };

  // Prisma unique constraint violation (e.g. duplicate email/sku)
  if (prismaErr.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this unique value already exists.',
    });
    return;
  }

  // Prisma record not found
  if (prismaErr.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Requested record was not found.',
    });
    return;
  }

  // Prisma foreign key constraint violation (e.g. deleting category with active products)
  if (prismaErr.code === 'P2003' || prismaErr.code === 'P2014') {
    res.status(409).json({
      success: false,
      message: 'Cannot modify or delete this record because it is referenced by other records.',
    });
    return;
  }

  // Prisma value out of range or invalid column value
  if (prismaErr.code === 'P2000') {
    res.status(400).json({
      success: false,
      message: 'Provided value exceeds allowed limits or length for this field.',
    });
    return;
  }

  // Any other Prisma / Database errors — never expose SQL, table schemas, or raw database messages
  if (prismaErr.code?.startsWith('P') || prismaErr.name?.includes('Prisma')) {
    logger.error(`[Database Error] ${req.method} ${req.originalUrl} — Code: ${prismaErr.code}`, {
      message: err.message,
      stack: err.stack,
    });
    res.status(400).json({
      success: false,
      message: 'Database operation failed due to invalid data or constraints.',
    });
    return;
  }

  // Log full server-side debugging details for unhandled/internal errors
  logger.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  // Never return stack traces, internal file paths, or raw exceptions to the user/client
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
