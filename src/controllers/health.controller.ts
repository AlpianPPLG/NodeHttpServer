/**
 * Health check controller
 */

import { Request, Response } from 'express';
import { HealthCheckResponse } from '../types';
import { config } from '../config/env';
import { asyncHandler } from '../middleware/errorHandler';
import { checkDatabaseHealth } from '../database/prisma';
import { prisma } from '@/database';

class HealthController {
  /**
   * Basic health check endpoint
   */
  public getHealth = asyncHandler(async (req: Request, res: Response) => {
    const uptime = process.uptime();

    // Check database connection
    let databaseStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'error';
    }

    const healthResponse: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime,
      version: '1.0.0',
      environment: config.server.env,
      services: {
        database: databaseStatus,
        redis: config.redis.enabled ? 'disconnected' : 'disconnected',
      },
    };

    res.status(200).json(healthResponse);
  });

  /**
   * Detailed health check with service status
   */
  public getHealthDetailed = asyncHandler(
    async (req: Request, res: Response) => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      // Check database connection
      let databaseStatus: 'connected' | 'disconnected' | 'error' =
        'disconnected';
      try {
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
      } catch (error) {
        databaseStatus = 'error';
      }

      // Check Redis connection (placeholder)
      let redisStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
      if (config.redis.enabled) {
        try {
          // TODO: Add actual Redis health check when Redis is implemented
          // await redis.ping();
          // redisStatus = 'connected';
        } catch (error) {
          redisStatus = 'error';
        }
      }

      const healthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime,
        version: '1.0.0',
        environment: config.server.env,
        services: {
          database: databaseStatus,
          redis: redisStatus,
        },
        system: {
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          },
          cpu: {
            usage: process.cpuUsage(),
          },
          node: {
            version: process.version,
            platform: process.platform,
            arch: process.arch,
          },
        },
      };

      // Determine overall status
      const allServicesHealthy = Object.values(healthResponse.services).every(
        status => status !== 'error'
      );

      if (!allServicesHealthy) {
        healthResponse.status = 'error';
        res.status(503);
      }

      res.json(healthResponse);
    }
  );

  /**
   * Readiness probe for Kubernetes
   */
  public getReadiness = asyncHandler(async (req: Request, res: Response) => {
    // Check if application is ready to serve requests
    const isReady = true; // TODO: Add actual readiness checks

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * Liveness probe for Kubernetes
   */
  public getLiveness = asyncHandler(async (req: Request, res: Response) => {
    // Check if application is alive
    const isAlive = true; // Application is alive if it can respond

    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}

export const healthController = new HealthController();
