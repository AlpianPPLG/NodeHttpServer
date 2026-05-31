/**
 * Security middleware
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { TooManyRequestsError } from '../types/error.types';

// Helmet configuration for security headers
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// CORS configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (config.cors.origin.includes(origin) || config.cors.origin.includes('*')) {
      return callback(null, true);
    }
    
    logger.warn('CORS blocked request', { origin, component: 'security' });
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
});

// Rate limiting configuration
export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      requestId: req.requestId,
      component: 'security',
    });
    
    next(new TooManyRequestsError('Too many requests, please try again later'));
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.userId || req.ip || 'unknown';
  },
});

// Stricter rate limiting for auth endpoints
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    status: 'error',
    code: 'TOO_MANY_AUTH_ATTEMPTS',
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      requestId: req.requestId,
      component: 'security',
    });
    
    next(new TooManyRequestsError('Too many authentication attempts, please try again later'));
  },
});

// Request size limiting middleware
export const requestSizeLimitMiddleware = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      logger.warn('Request size limit exceeded', {
        size: contentLength,
        maxSize,
        ip: req.ip,
        url: req.url,
        requestId: req.requestId,
        component: 'security',
      });
      
      res.status(413).json({
        status: 'error',
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request entity too large',
      });
      return;
    }
    
    next();
  };
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelistMiddleware = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP || '')) {
      logger.warn('IP not whitelisted', {
        ip: clientIP,
        allowedIPs,
        url: req.url,
        requestId: req.requestId,
        component: 'security',
      });
      
      res.status(403).json({
        status: 'error',
        code: 'IP_NOT_ALLOWED',
        message: 'Access denied from this IP address',
      });
      return;
    }
    
    next();
  };
};

// Security headers middleware
export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};