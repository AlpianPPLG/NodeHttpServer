/**
 * Prisma Client Instance
 * Singleton pattern for database connection
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config/env';

// Prisma Client options
const prismaOptions = {
  log: [
    {
      emit: 'event' as const,
      level: 'query' as const,
    },
    {
      emit: 'event' as const,
      level: 'error' as const,
    },
    {
      emit: 'event' as const,
      level: 'warn' as const,
    },
  ],
};

// Create Prisma Client instance
const prismaClientSingleton = () => {
  return new PrismaClient(prismaOptions);
};

// Declare global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Use singleton pattern to avoid multiple instances
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (config.server.env !== 'production') {
  globalThis.prisma = prisma;
}

// Setup event listeners for logging
prisma.$on('query', (e) => {
  if (config.server.isDevelopment) {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
      component: 'database',
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error', {
    message: e.message,
    target: e.target,
    component: 'database',
  });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', {
    message: e.message,
    target: e.target,
    component: 'database',
  });
});

// Test database connection
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully', {
      component: 'database',
    });
  } catch (error) {
    logger.warn('⚠️ Database connection failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'database',
    });
    throw error;
  }
}

// Disconnect database
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected', {
      component: 'database',
    });
  } catch (error) {
    logger.error('Error disconnecting database', {
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'database',
    });
  }
}

// Health check for database
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

export default prisma;