/**
 * Prisma Client Singleton
 * Ensures only one Prisma Client instance is created to avoid connection leaks
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle connection lifecycle
prisma
  .$connect()
  .then(() => {
    logger.info('✅ Successfully connected to database via Prisma');
  })
  .catch((error: any) => {
    logger.error('❌ Failed to connect to database:', error);
    // Don't exit in development - allow server to run without database
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing Prisma Client');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing Prisma Client');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
