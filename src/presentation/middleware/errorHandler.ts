/**
 * Error handling middleware
 * Catches all errors and returns structured JSON responses
 */

import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../shared/errors/CustomError';
import { logger } from '../../config/logger';
import { APIResponse } from '../../shared/types';

/**
 * Global error handler middleware
 * Should be registered last in Express middleware chain
 */
export const errorHandler = (
  error: Error | CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Handle custom errors
  if (error instanceof CustomError) {
    logger.warn(`Custom error: ${error.code}`, {
      message: error.message,
      statusCode: error.statusCode,
    });

    const response: APIResponse = error.toJSON();
    return res.status(error.statusCode).json(response);
  }

  // Handle unexpected errors
  logger.error('Unexpected error', error);

  const response: APIResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date(),
    },
  };

  return res.status(500).json(response);
};

/**
 * Async error wrapper to catch errors in async route handlers
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
