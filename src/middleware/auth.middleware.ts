/**
 * JWT authentication middleware
 * Verifies JWT token and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../types/error.types';
import { authService } from '@/services/auth.service';
import { logger } from '@/utils/logger';

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header (Bearer <token>)
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedError('Missing authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1]!;

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user ID to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip,
      path: req.path,
      requestId: req.requestId,
    });

    next(error);
  }
};

/**
 * Optional auth middleware
 * Does not throw error if token is missing, but verifies if present
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1]!;

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user ID to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    // Log but don't fail
    logger.debug('Optional authentication check failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    next();
  }
};
