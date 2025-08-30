import express from 'express';
import cors from 'cors';

import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './lib/middleware.js';

import servicesRouter from './routes/services.js';
import staffRouter from './routes/staff.js';
import scheduleRouter from './routes/schedule.js';
import timeoffRouter from './routes/timeoff.js';
import bookingsRouter from './routes/bookings.js';
import customersRouter from './routes/customers.js';
import settingsRouter from './routes/settings.js';
import publicRouter from './routes/public.js';
import mediaRouter from './routes/media.js';
import notificationsRouter from './routes/notifications.js';
import advancedBookingsRouter from './routes/advanced-bookings.js';

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  const start = Date.now();
  
  // Log request
  logger.debug('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Log response when finished
  _res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req.method, req.url, _res.statusCode, duration);
  });

  next();
});

// Tenant middleware (DEV: fixed tenant - always set t_dev for Dev)
app.use((req, _res, next) => { 
  // In DEV-Mode always set t_dev
  req.tenantId = 't_dev';
  // Add tenant ID to headers for new routes
  req.headers['x-tenant-id'] = 't_dev';
  next();
});

// Dev-Auth via Header
app.use((req, _res, next) => {
  const role = req.header('x-user-role');
  const email = req.header('x-user-email');
  if (role && email) {
    req.user = { role, email };
  }
  next();
});

// Health endpoint (without DB dependencies for tests)
app.get('/api/ping', (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/media', mediaRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/bookings', advancedBookingsRouter);
app.use(servicesRouter);
app.use(staffRouter);
app.use(scheduleRouter);
app.use(timeoffRouter);
app.use(bookingsRouter);
app.use(customersRouter);
app.use(settingsRouter);
app.use(publicRouter);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
