import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  if (process.env['NODE_ENV'] !== 'production') {
    logger.debug(`${req.method} ${req.url}`);
  }
  next();
}
