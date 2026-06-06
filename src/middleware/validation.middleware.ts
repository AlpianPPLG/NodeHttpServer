/**
 * Request validation middleware using Zod
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../types/error.types';
import { logger } from '../utils/logger';

// Validation targets
type ValidationTarget = 'body' | 'query' | 'params' | 'headers';

/**
 * Generic validation middleware
 */
export const validate = (
  schema: z.ZodSchema<any>,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get data to validate based on target
      const data = req[target];
      
      // Validate and transform data
      const validatedData = schema.parse(data);
      
      // Replace original data with validated/transformed data
      (req as any)[target] = validatedData;
      
      logger.debug('Validation successful', {
        component: 'validation',
        target,
        requestId: req.requestId,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        logger.warn('Validation failed', {
          component: 'validation',
          target,
          errors: validationErrors,
          requestId: req.requestId,
        });
        
        const validationError = new ValidationError('Validation failed');
        (validationError as any).errors = validationErrors;
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Body validation middleware
 */
export const validateBody = (schema: z.ZodSchema<any>) => validate(schema, 'body');

/**
 * Query validation middleware
 */
export const validateQuery = (schema: z.ZodSchema<any>) => validate(schema, 'query');

/**
 * Params validation middleware
 */
export const validateParams = (schema: z.ZodSchema<any>) => validate(schema, 'params');

/**
 * Headers validation middleware
 */
export const validateHeaders = (schema: z.ZodSchema<any>) => validate(schema, 'headers');

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID parameter validation
  uuidParam: z.object({
    id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 'Invalid UUID format'),
  }),
  
  // Custom ID parameter validation (for our mock user IDs)
  idParam: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  
  // Pagination query validation
  paginationQuery: z.object({
    page: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 1)
      .refine(val => val > 0, 'Page must be positive'),
    limit: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 20)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    sort: z
      .string()
      .optional()
      .default('createdAt'),
    order: z
      .enum(['asc', 'desc'])
      .optional()
      .default('desc'),
  }),
  
  // Search query validation
  searchQuery: z.object({
    q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
    ...z.object({
      page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    }).shape,
  }),
};

/**
 * Alias for validateBody - validates request body
 */
export const validateRequest = (schema: z.ZodSchema<any>) => validateBody(schema);

/**
 * Validation error formatter
 */
export const formatValidationError = (error: ZodError): string => {
  const errors = error.errors.map(err => {
    const field = err.path.join('.');
    return `${field}: ${err.message}`;
  });
  
  return errors.join(', ');
};