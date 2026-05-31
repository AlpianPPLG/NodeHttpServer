/**
 * Health check routes
 */

import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 environment:
 *                   type: string
 *                   example: development
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [connected, disconnected, error]
 *                     redis:
 *                       type: string
 *                       enum: [connected, disconnected, error]
 */
router.get('/', healthController.getHealth);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed health status including system metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 *       503:
 *         description: Service unavailable
 */
router.get('/detailed', healthController.getHealthDetailed);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Kubernetes readiness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', healthController.getReadiness);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Kubernetes liveness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', healthController.getLiveness);

export { router as healthRoutes };
