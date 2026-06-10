/**
 * Request logging middleware
 * Logs incoming requests and outgoing responses
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';

/**
 * Request logging middleware
 * Logs HTTP method, path, status code, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const { method, path, ip } = req;

  // Log incoming request
  logger.debug(`Incoming request: ${method} ${path} from ${ip}`);

  // Capture response
  const originalSend = res.send;
  res.send = function (data: unknown) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    logger.info(`Request completed: ${method} ${path} ${statusCode} (${duration}ms)`);

    return originalSend.call(this, data);
  };

  next();
};
