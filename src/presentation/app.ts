/**
 * Express application configuration
 * Sets up middleware, error handling, and basic routes
 */

import express, { Express } from 'express';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logger } from '../config/logger';
import { APIResponse } from '../shared/types';
import { createRoutes } from './routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use(requestLogger);

  // API routes (v1)
  app.use('/api/v1', createRoutes());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    const response: APIResponse = {
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
      },
    };
    res.json(response);
  });

  // API version endpoint
  app.get('/api/version', (_req, res) => {
    const response: APIResponse = {
      success: true,
      data: {
        version: '1.0.0',
        timestamp: new Date(),
      },
    };
    res.json(response);
  });

  // Health check on root
  app.get('/', (_req, res) => {
    const response: APIResponse = {
      success: true,
      data: {
        message: 'Welcome to Ecommerce Store API',
        version: '1.0.0',
        docs: '/api-docs',
      },
    };
    res.json(response);
  });

  // 404 handler
  app.use((_req, res) => {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
        timestamp: new Date(),
      },
    };
    res.status(404).json(response);
  });

  // Error handler (must be last)
  app.use(errorHandler);

  logger.info('Express app configured');

  return app;
};
