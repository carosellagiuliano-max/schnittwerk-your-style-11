/**
 * Client-side logger utility
 * Provides structured logging for the frontend application
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
}

class ClientLogger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const baseMessage = `[${timestamp}] ${levelName}: ${message}`;
    
    if (data !== undefined) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  error(message: string, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(LogLevel.ERROR, message, error?.message);
      console.error(formattedMessage);
      if (error?.stack) {
        console.error(error.stack);
      }
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(LogLevel.WARN, message, data);
      console.warn(formattedMessage);
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(LogLevel.INFO, message, data);
      console.info(formattedMessage);
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, data);
      console.debug(formattedMessage);
    }
  }

  log(message: string, data?: unknown): void {
    this.info(message, data);
  }
}

// Create a singleton logger instance
const isDevelopment = import.meta.env.DEV;
export const logger = new ClientLogger(
  isDevelopment ? LogLevel.DEBUG : LogLevel.WARN
);
