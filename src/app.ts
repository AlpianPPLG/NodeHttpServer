/**
 * Express application setup
 */

import express from 'express';
import compression from 'compression';
import 'express-async-errors'; // Handle async errors automatically

// Import middleware
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
  securityHeadersMiddleware,
} from './middleware/security';
import {
  requestIdMiddleware,
  requestLogger,
  requestTimingMiddleware,
  requestSizeMiddleware,
} from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import { routes } from './routes';

// Import config and logger
import { config } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase } from './database/prisma';

/**
 * Create Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Trust proxy (for accurate IP addresses behind load balancers)
  app.set('trust proxy', 1);

  // Security middleware (applied first)
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(securityHeadersMiddleware);

  // Request processing middleware
  app.use(requestIdMiddleware);
  app.use(requestTimingMiddleware);
  app.use(requestSizeMiddleware);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Logging middleware
  app.use(requestLogger);

  // Rate limiting (after logging)
  app.use(rateLimitMiddleware);

  // Routes
  app.use('/', routes);

  // 404 handler (must be after all routes)

  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
export async function startServer(): Promise<void> {
  // Try to connect to database (optional)
  try {
    await connectDatabase();
  } catch (error) {
    logger.warn('Database connection failed, continuing without database...', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'database' 
    });
  }

  const app = createApp();
  const port = config.server.port;

  const server = app.listen(port, () => {
    logger.info(`🚀 Velocity HTTP Server started`, {
      port,
      environment: config.server.env,
      version: '1.0.0',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `📚 Health check available at: http://localhost:${port}/health`
    );

    if (config.swagger.enabled) {
      logger.info(
        `📖 API documentation will be available at: http://localhost:${port}${config.swagger.path}`
      );
    }
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      // Close database connections
      const { disconnectDatabase } = await import('./database/prisma');
      await disconnectDatabase();

      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error(
        'Could not close connections in time, forcefully shutting down'
      );
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}
