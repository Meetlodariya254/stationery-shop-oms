/**
 * Auth Controller
 * Handles login, refresh, logout, and password change.
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { AppError } from '../../middleware/errorHandler';
import { sendPasswordResetEmail } from '../../lib/email';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: payload,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    const newPayload = { userId: payload.userId, email: payload.email, role: payload.role, name: payload.name };
    const newAccessToken = signAccessToken(newPayload);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Remove all refresh tokens for this user
    await prisma.refreshToken.deleteMany({ where: { userId: req.user!.userId } });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        customer: {
          include: {
            addresses: true,
          },
        },
      },
    });

    if (!user) throw new AppError(404, 'User not found');

    res.json({ success: true, message: 'User fetched', data: user });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError(404, 'User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError(400, 'Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email } = req.body as { name?: string; email?: string };

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError(404, 'User not found');

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new AppError(409, 'Email address is already in use');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    if (!email) throw new AppError(400, 'Email address is required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      // Return success to prevent email enumeration, but only send if user exists
      res.json({ success: true, message: 'If that email is registered, a verification code has been sent.' });
      return;
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Remove any existing OTP for this email
    await prisma.passwordResetOtp.deleteMany({ where: { email: user.email } });

    // Store new OTP
    await prisma.passwordResetOtp.create({
      data: {
        email: user.email,
        otp,
        expiresAt,
      },
    });

    // Send via email / logger
    await sendPasswordResetEmail(user.email, user.name, otp);

    res.json({ success: true, message: 'Verification code sent to your email address.' });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp, newPassword } = req.body as { email?: string; otp?: string; newPassword?: string };
    if (!email || !otp || !newPassword) {
      throw new AppError(400, 'Email, verification code, and new password are required');
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: { email, otp },
    });

    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await prisma.passwordResetOtp.delete({ where: { id: record.id } });
      }
      throw new AppError(400, 'Invalid or expired verification code');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(404, 'User not found');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    // Clean up OTPs and existing refresh tokens so all devices re-authenticate
    await prisma.passwordResetOtp.deleteMany({ where: { email } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    res.json({ success: true, message: 'Password has been reset successfully. Please sign in.' });
  } catch (error) {
    next(error);
  }
}

