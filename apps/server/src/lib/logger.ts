/**
 * Winston Logger
 * Structured logging with timestamp and colored output for development.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack ?? message}`;
});

export const logger = winston.createLogger({
  level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env['NODE_ENV'] === 'production'
      ? winston.format.json()
      : combine(colorize(), devFormat)
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env['NODE_ENV'] === 'production'
      ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
         new winston.transports.File({ filename: 'logs/combined.log' })]
      : []),
  ],
});
