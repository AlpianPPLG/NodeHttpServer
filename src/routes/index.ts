/**
 * Main routes aggregator
 */

import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { swaggerRoutes } from './swagger.routes';
import { config } from '../config/env';
import { apiV1Routes } from './api-v1';

const router = Router();

// Health check routes (no API version prefix)
router.use('/health', healthRoutes);

// API versioned routes
const apiRouter = Router();

// v1 API routes
// NOTE: These are currently placeholders until controllers/services are fully implemented.
// Mounted under /api/v1
apiRouter.use('/', apiV1Routes);

// Mount API routes with version prefix
router.use(`/api/${config.server.apiVersion}`, apiRouter);

// API documentation route
router.use('/', swaggerRoutes);

export { router as routes };
