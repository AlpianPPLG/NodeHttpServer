/**
 * Request logging middleware
 */

import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { httpLoggerStream, logger } from '../utils/logger';
import { config } from '../config/env';

// Add request ID to all requests
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.requestId = req.get('X-Request-ID') || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Custom Morgan tokens
morgan.token('id', (req: Request) => req.requestId || '');
morgan.token('user-id', (req: Request) => req.userId || 'anonymous');
morgan.token('real-ip', (req: Request) => {
  return req.get('X-Forwarded-For') || 
         req.get('X-Real-IP') || 
         req.connection.remoteAddress || 
         req.ip;
});

// Morgan format for development
const devFormat = ':method :url :status :response-time ms - :res[content-length] [:id]';

// Morgan format for production
const prodFormat = JSON.stringify({
  timestamp: ':date[iso]',
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  ip: ':real-ip',
  requestId: ':id',
  userId: ':user-id',
});

// Create Morgan middleware
export const requestLogger = morgan(
  config.server.isDevelopment ? devFormat : prodFormat,
  {
    stream: httpLoggerStream,
    skip: (req: Request, res: Response) => {
      // Skip health check logs in production
      if (config.server.isProduction && req.path === '/health') {
        return true;
      }
      return false;
    },
  }
);

// Request start time middleware
export const requestTimingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) { // > 1 second
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        status: res.statusCode,
        requestId: req.requestId,
        userId: req.userId,
      });
    }
  });
  
  next();
};

// Request size middleware
export const requestSizeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = req.get('Content-Length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    
    // Log large requests
    if (size > 1024 * 1024) { // > 1MB
      logger.warn('Large request detected', {
        method: req.method,
        url: req.url,
        size,
        requestId: req.requestId,
        userId: req.userId,
      });
    }
  }
  
  next();
};