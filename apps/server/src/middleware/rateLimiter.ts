/**
 * Rate Limiter Middleware
 * Prevents brute-force attacks and API abuse using tiered rate limits and exponential backoff.
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// --- Helper to parse env integers cleanly with fallbacks ---
function getEnvInt(key: string, defaultValue: number): number {
  const val = process.env[key];
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ============================================================================
// 1. AUTHENTICATION ROUTE LIMITER (Exponential Backoff, Per-IP + Per-Account)
// ============================================================================

interface AttemptRecord {
  count: number;
  lastAttempt: number;
}

class AuthRateLimiterStore {
  private ipAttempts: Map<string, AttemptRecord> = new Map();
  private accountAttempts: Map<string, AttemptRecord> = new Map();
  private lastCleanup: number = Date.now();

  private cleanup(windowMs: number) {
    const now = Date.now();
    if (now - this.lastCleanup < 60_000) return; // Cleanup at most once per minute
    this.lastCleanup = now;

    for (const [key, record] of this.ipAttempts.entries()) {
      if (now - record.lastAttempt > windowMs) {
        this.ipAttempts.delete(key);
      }
    }
    for (const [key, record] of this.accountAttempts.entries()) {
      if (now - record.lastAttempt > windowMs) {
        this.accountAttempts.delete(key);
      }
    }
  }

  public recordAttempt(key: string, type: 'ip' | 'account', windowMs: number): number {
    this.cleanup(windowMs);
    const store = type === 'ip' ? this.ipAttempts : this.accountAttempts;
    const now = Date.now();
    const existing = store.get(key);

    if (!existing || now - existing.lastAttempt > windowMs) {
      store.set(key, { count: 1, lastAttempt: now });
      return 1;
    }

    existing.count += 1;
    existing.lastAttempt = now;
    return existing.count;
  }

  public clearAttempt(key: string, type: 'ip' | 'account') {
    const store = type === 'ip' ? this.ipAttempts : this.accountAttempts;
    store.delete(key);
  }
}

const authStore = new AuthRateLimiterStore();

export async function authLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const windowMs = getEnvInt('RATE_LIMIT_AUTH_WINDOW_MS', 15 * 60 * 1000);
  const maxIpAttempts = getEnvInt('RATE_LIMIT_AUTH_MAX_IP', 20);
  const maxAccountAttempts = getEnvInt('RATE_LIMIT_AUTH_MAX_ACCOUNT', 10);
  const baseDelayMs = getEnvInt('RATE_LIMIT_AUTH_BASE_DELAY_MS', 1000);
  const maxDelayMs = getEnvInt('RATE_LIMIT_AUTH_MAX_DELAY_MS', 60_000);
  const ceilingIp = getEnvInt('RATE_LIMIT_AUTH_CEILING_IP', 100);
  const ceilingAccount = getEnvInt('RATE_LIMIT_AUTH_CEILING_ACCOUNT', 50);

  // Extract IP
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';

  // Extract Account Key (e.g. email or username)
  let accountKey: string | null = null;
  if (req.body && typeof req.body.email === 'string' && req.body.email.trim()) {
    accountKey = `email:${req.body.email.toLowerCase().trim()}`;
  } else if (req.body && typeof req.body.username === 'string' && req.body.username.trim()) {
    accountKey = `username:${req.body.username.toLowerCase().trim()}`;
  }

  const ipCount = authStore.recordAttempt(ip, 'ip', windowMs);
  const accountCount = accountKey ? authStore.recordAttempt(accountKey, 'account', windowMs) : 0;

  // Calculate exponential backoff delays
  let ipDelay = 0;
  if (ipCount >= maxIpAttempts) {
    const exponent = ipCount - maxIpAttempts;
    ipDelay = Math.min(baseDelayMs * Math.pow(2, exponent), maxDelayMs);
  }

  let accountDelay = 0;
  if (accountCount >= maxAccountAttempts) {
    const exponent = accountCount - maxAccountAttempts;
    accountDelay = Math.min(baseDelayMs * Math.pow(2, exponent), maxDelayMs);
  }

  const requiredDelayMs = Math.max(ipDelay, accountDelay);

  // Safety ceiling check to prevent resource exhaustion / hard denial protection
  if (ipCount >= ceilingIp || (accountKey && accountCount >= ceilingAccount)) {
    const retryAfterSec = Math.ceil(Math.max(requiredDelayMs, baseDelayMs) / 1000);
    res.setHeader('Retry-After', String(retryAfterSec));
    res.status(429).json({
      success: false,
      message: `Too many authentication attempts. Please wait ${retryAfterSec} seconds before trying again.`,
    });
    return;
  }

  // Clear attempts on successful login/reset
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      authStore.clearAttempt(ip, 'ip');
      if (accountKey) {
        authStore.clearAttempt(accountKey, 'account');
      }
    }
  });

  if (requiredDelayMs > 0) {
    res.setHeader('X-RateLimit-Delay', String(requiredDelayMs));
    await new Promise((resolve) => setTimeout(resolve, requiredDelayMs));
  }

  next();
}

// ============================================================================
// 2. PUBLIC ENDPOINT LIMITER (Moderate limits for unauthenticated requests)
// ============================================================================

export const publicLimiter = rateLimit({
  windowMs: getEnvInt('RATE_LIMIT_PUBLIC_WINDOW_MS', 15 * 60 * 1000),
  max: getEnvInt('RATE_LIMIT_PUBLIC_MAX', 200),
  skip: (req: Request) => {
    // Skip if user is authenticated OR if hitting auth endpoints (which have authLimiter)
    return Boolean(req.user) || req.path.startsWith('/api/v1/auth') || req.path.startsWith('/auth');
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  message: {
    success: false,
    message: 'Too many public requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Alias for backwards compatibility
export const generalLimiter = publicLimiter;

// ============================================================================
// 3. AUTHENTICATED ACTION LIMITER (Looser limits for logged-in users)
// ============================================================================

export const authenticatedLimiter = rateLimit({
  windowMs: getEnvInt('RATE_LIMIT_AUTHENTICATED_WINDOW_MS', 15 * 60 * 1000),
  max: getEnvInt('RATE_LIMIT_AUTHENTICATED_MAX', 1000),
  skip: (req: Request) => {
    // Only apply to authenticated users
    return !req.user;
  },
  keyGenerator: (req: Request) => {
    return req.user?.userId || req.ip || req.socket.remoteAddress || 'unknown';
  },
  message: {
    success: false,
    message: 'Too many requests from your account, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

