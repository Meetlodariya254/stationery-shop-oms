/**
 * JWT Helper
 * Sign, verify, and decode JWT access and refresh tokens.
 */

import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

const ACCESS_SECRET = process.env['JWT_SECRET'] ?? 'fallback-secret-change-in-production';
const REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] ?? 'fallback-refresh-secret';
const ACCESS_EXPIRES = process.env['JWT_EXPIRES_IN'] ?? '7d';
const REFRESH_EXPIRES = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d';

if (process.env['NODE_ENV'] === 'production' && (ACCESS_SECRET === 'fallback-secret-change-in-production' || REFRESH_SECRET === 'fallback-refresh-secret')) {
  throw new Error('FATAL SECURITY ERROR: Default JWT secrets detected in production environment! Please define JWT_SECRET and JWT_REFRESH_SECRET explicitly.');
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
