import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors.js';
import { logger } from './logger.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent header errors if response already sent
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let context: Record<string, unknown> = {};

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    context = error.context || {};
  }

  // Log the error
  logger.error('Request failed', error, {
    method: req.method,
    url: req.url,
    statusCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    ...context
  });

  // Send error response
  const errorResponse: Record<string, unknown> = {
    error: message,
    statusCode
  };

  // Include context in development mode
  if (process.env.NODE_ENV === 'development' || process.env.DEV_MODE === '1') {
    errorResponse.context = context;
    if (error.stack) {
      errorResponse.stack = error.stack;
    }
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Handler Middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  res.status(404).json({
    error: 'Route not found',
    statusCode: 404,
    path: req.url
  });
};

/**
 * Async Handler Wrapper
 * Catches async errors and passes them to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
