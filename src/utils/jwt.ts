/**
 * JWT token utilities
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from './logger';
import { JwtPayload, AuthUser } from '../types/auth.types';
import { UnauthorizedError } from '../types/error.types';

/**
 * Generate access token
 */
export function generateAccessToken(user: AuthUser): string {
  const payload: Partial<JwtPayload> = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  const token = jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiration,
    issuer: 'velocity-api',
    audience: 'velocity-app',
  });

  logger.debug('Access token generated', {
    component: 'auth',
    userId: user.id,
    tokenType: 'access',
  });

  return token;
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(user: AuthUser): string {
  const payload: Partial<JwtPayload> = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh',
  };

  const token = jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtRefreshExpiration,
    issuer: 'velocity-api',
    audience: 'velocity-app',
  });

  logger.debug('Refresh token generated', {
    component: 'auth',
    userId: user.id,
    tokenType: 'refresh',
  });

  return token;
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret, {
      issuer: 'velocity-api',
      audience: 'velocity-app',
    }) as JwtPayload;

    logger.debug('Token verified successfully', {
      component: 'auth',
      userId: decoded.userId,
      tokenType: decoded.type,
    });

    return decoded;
  } catch (error) {
    logger.warn('Token verification failed', {
      component: 'auth',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    
    if (error instanceof jwt.NotBeforeError) {
      throw new UnauthorizedError('Token not active');
    }

    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new UnauthorizedError('Authorization header missing');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Invalid authorization format');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    throw new UnauthorizedError('Token missing');
  }

  return token;
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpirationTime(): number {
  // Parse JWT expiration time (e.g., "24h" -> seconds)
  const expiresIn = config.auth.jwtExpiration;
  
  if (expiresIn.endsWith('d')) {
    return parseInt(expiresIn) * 24 * 60 * 60;
  }
  
  if (expiresIn.endsWith('h')) {
    return parseInt(expiresIn) * 60 * 60;
  }
  
  if (expiresIn.endsWith('m')) {
    return parseInt(expiresIn) * 60;
  }
  
  if (expiresIn.endsWith('s')) {
    return parseInt(expiresIn);
  }
  
  // Default to 24 hours if format not recognized
  return 24 * 60 * 60;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}