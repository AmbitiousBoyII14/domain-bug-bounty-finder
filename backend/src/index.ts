import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import logger from './utils/logger';
import { startWorker } from './jobs/worker';

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    if (env.NODE_ENV !== 'test') {
      try {
        startWorker();
        logger.info('Background worker started');
      } catch (err) {
        logger.warn('Background worker failed to start (Redis may be unavailable):', err);
      }
    }

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`API Docs: http://localhost:${env.PORT}/api/docs`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });

main();
