/**
 * Logger utility for consistent logging across the application
 * Supports different log levels: debug, info, warn, error
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private currentLogLevel: LogLevel;

  constructor() {
    this.currentLogLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(this.currentLogLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = this.formatTimestamp();
    if (data) {
      return `[${timestamp}] [${level}] ${message} ${JSON.stringify(data)}`;
    }
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }
  }

  error(message: string, error?: Error | unknown, data?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      let errorMessage = this.formatMessage(LogLevel.ERROR, message);
      if (error instanceof Error) {
        errorMessage += ` | Error: ${error.message}`;
        if (process.env.NODE_ENV === 'development') {
          errorMessage += ` | Stack: ${error.stack}`;
        }
      }
      console.error(errorMessage, data || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();
