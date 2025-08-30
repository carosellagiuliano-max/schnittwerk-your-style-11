/**
 * Professional Logger Utility
 * Provides structured logging with different levels and environments
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === '1';

  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    if (this.isDevelopment) {
      // Readable format for development
      let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      if (context && Object.keys(context).length > 0) {
        logMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
      }
      if (error) {
        logMessage += `\nError: ${error.stack || error.message}`;
      }
      return logMessage;
    } else {
      // JSON format for production
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(context && { context }),
        ...(error && { error: { message: error.message, stack: error.stack } })
      });
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };

    const formattedMessage = this.formatLogEntry(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
    }
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Request logging helper
  logRequest(method: string, url: string, statusCode?: number, duration?: number): void {
    this.info('HTTP Request', {
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined
    });
  }
}

export const logger = new Logger();
export default logger;
