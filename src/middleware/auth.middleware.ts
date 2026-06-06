/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { mockUserRepository } from '../repositories/mock-user.repository';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../types/error.types';
import { logger } from '../utils/logger';
import { Role } from '../types/auth.types';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.get('Authorization'));
    
    // Verify token
    const payload = verifyToken(token);
    
    // Check if it's an access token
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Find user
    const user = await mockUserRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is suspended or banned');
    }

    // Attach user info to request
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    logger.debug('User authenticated', {
      component: 'auth',
      userId: user.id,
      email: user.email,
      role: user.role,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      component: 'auth',
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    next(error);
  }
};

/**
 * Optional authentication - continues even if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.get('Authorization');
    
    if (!authHeader) {
      // No token provided, continue without authentication
      return next();
    }

    // If token is provided, validate it
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    
    if (payload.type !== 'access') {
      // Invalid token type, continue without authentication
      return next();
    }

    // Find user
    const user = await mockUserRepository.findById(payload.userId);
    if (user && user.status === 'ACTIVE') {
      // Attach user info to request
      req.userId = user.id;
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      logger.debug('Optional auth: User authenticated', {
        component: 'auth',
        userId: user.id,
        requestId: req.requestId,
      });
    }

    next();
  } catch (error) {
    // For optional auth, we continue even if token verification fails
    logger.debug('Optional auth failed, continuing without authentication', {
      component: 'auth',
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.requestId,
    });

    next();
  }
};

/**
 * Authorization middleware - check if user has required role
 */
export const requireRole = (roles: Role | Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role as Role)) {
      logger.warn('Authorization failed: insufficient permissions', {
        component: 'auth',
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        requestId: req.requestId,
      });

      throw new ForbiddenError('Insufficient permissions');
    }

    logger.debug('Authorization successful', {
      component: 'auth',
      userId: req.user.id,
      userRole: req.user.role,
      requestId: req.requestId,
    });

    next();
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Moderator or Admin middleware
 */
export const requireModerator = requireRole(['ADMIN', 'MODERATOR']);

/**
 * User ownership middleware - check if user owns the resource
 */
export const requireOwnership = (getUserIdFromParams: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admins can access any resource
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const resourceUserId = getUserIdFromParams(req);
    
    if (!resourceUserId) {
      throw new BadRequestError('Resource user ID not found in request parameters');
    }
    
    if (req.user.id !== resourceUserId) {
      logger.warn('Authorization failed: resource ownership check', {
        component: 'auth',
        userId: req.user.id,
        resourceUserId,
        requestId: req.requestId,
      });

      throw new ForbiddenError('Access denied: resource ownership required');
    }

    next();
  };
};

/**
 * Self-only middleware - user can only access their own resources
 */
export const requireSelf = requireOwnership((req: Request) => req.params.id || req.params.userId);