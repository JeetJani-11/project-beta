/**
 * Application entry point
 * Starts the Express server
 */

import dotenv from 'dotenv';
import { createApp } from './presentation/app';
import { logger } from './config/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function main(): Promise<void> {
  try {
    // Create Express app
    const app = createApp();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server started`, {
        port: PORT,
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Run application
main();
