/**
 * Server Entry Point
 * Loads environment, initializes Express app, connects to DB and starts listening.
 */

import 'dotenv/config';
import { app } from './app';
import { prisma } from './lib/prisma';
import { logger } from './lib/logger';

const PORT = process.env['PORT'] ? parseInt(process.env['PORT']) : 3001;

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
