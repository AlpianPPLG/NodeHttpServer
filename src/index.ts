/**
 * Velocity HTTP Server - Main Entry Point
 * 
 * A modern, production-ready HTTP server built with:
 * - Node.js 20+ + Express 4.18+ + TypeScript 5.3+
 * - JWT Authentication, Prisma ORM, PostgreSQL
 * - Comprehensive security, logging, and error handling
 * 
 * @version 1.0.0
 * @author Velocity Contributors
 */

import { startServer } from './app';
import { logger } from './utils/logger';
import { config } from './config/env';

// Log startup information
logger.info('🚀 Starting Velocity HTTP Server...', {
  version: '1.0.0',
  environment: config.server.env,
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  pid: process.pid,
});

// Start the server
try {
  startServer();
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}