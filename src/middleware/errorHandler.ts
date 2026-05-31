/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../types/error.types';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let errors: any[] = [];

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  } else if (error.code === 'P2002') { // Prisma unique constraint
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (error.code === 'P2025') { // Prisma record not found
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Resource not found';
  }

  // Log error
  const logMeta = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: req.user,
    requestId: req.requestId,
  };

  if (statusCode >= 500) {
    logger.error(`${statusCode} ${code}: ${message}`, logMeta);
  } else {
    logger.warn(`${statusCode} ${code}: ${message}`, logMeta);
  }

  // Prepare response
  const response: ApiResponse = {
    status: 'error',
    message,
    ...(errors.length > 0 && { errors }),
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      path: req.path,
    },
  };

  // Add stack trace in development
  if (config.server.isDevelopment && error.stack) {
    (response as any).stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response: ApiResponse = {
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      path: req.path,
    },
  };

  logger.warn(`404 NOT_FOUND: Route ${req.method} ${req.path} not found`, {
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    requestId: req.requestId,
  });

  res.status(404).json(response);
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};