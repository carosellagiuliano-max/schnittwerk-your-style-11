import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { tenantId, requireRole } from '../lib/guards.js';
import { logger } from '../lib/logger.js';
import { asyncHandler } from '../lib/middleware.js';
import { createTenantDb } from '../lib/db-helpers.js';
import { 
  bookingSchema, 
  validateBody, 
  validateQuery, 
  paginationSchema,
  emailSchema 
} from '../lib/validation.js';
import { 
  ValidationError, 
  ConflictError, 
  ForbiddenError, 
  UnauthorizedError 
} from '../lib/errors.js';

const router = Router();

interface BookingWhere {
  tenantId: string;
  startAt?: {
    gte?: Date;
    lte?: Date;
  };
  staffId?: string;
  status?: string;
}

/**
 * Public: Create booking (Customer)
 */
router.post('/api/bookings', asyncHandler(async (req, res) => {
  const { serviceId, staffId, customerEmail, start } = validateBody(bookingSchema, req.body);
  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  // Check if customer is banned
  const isBanned = await tenantDb.isCustomerBanned(customerEmail);
  if (isBanned) {
    throw new ForbiddenError('Customer is banned');
  }

  // Validate service exists and is active
  const service = await tenantDb.findActiveService(serviceId);
  
  // Validate staff exists and is active
  const staff = await tenantDb.findActiveStaff(staffId);

  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + service.durationMin * 60000);

  // Check for booking conflicts
  const hasConflict = await tenantDb.hasBookingConflict(staffId, startDate, endDate);
  if (hasConflict) {
    throw new ConflictError('Time slot is already booked');
  }

  // Check if staff is available (not on time off)
  const isAvailable = await tenantDb.isStaffAvailable(staffId, startDate);
  if (!isAvailable) {
    throw new ConflictError('Staff is not available on this date');
  }

  const booking = await db.booking.create({
    data: {
      tenantId: t,
      serviceId,
      staffId,
      customerEmail,
      startAt: startDate,
      endAt: endDate,
      status: 'CONFIRMED',
      createdBy: customerEmail
    }
  });

  logger.info('Booking created', {
    bookingId: booking.id,
    customerEmail,
    serviceId,
    staffId,
    startAt: startDate.toISOString()
  });

  res.status(201).json(booking);
}));

/**
 * Public: Get customer's own bookings
 */
router.get('/api/bookings/me', asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'customer') {
    throw new UnauthorizedError('Customer login required');
  }

  const bookings = await db.booking.findMany({
    where: {
      tenantId: tenantId(req),
      customerEmail: req.user.email,
      status: 'CONFIRMED',
      startAt: { gte: new Date() } // Only future bookings
    },
    include: {
      service: { select: { name: true, durationMin: true } },
      staff: { select: { name: true } }
    },
    orderBy: { startAt: 'asc' }
  });

  res.json(bookings);
}));

/**
 * Public: Cancel booking (24h rule applies for customers)
 */
router.delete('/api/bookings/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  const booking = await tenantDb.findBooking(id);

  const isCustomer = req.user?.role === 'customer';
  
  if (isCustomer) {
    if (req.user!.email !== booking.customerEmail) {
      throw new ForbiddenError('Not your booking');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new ValidationError('Booking is already cancelled');
    }

    // 24h cancellation rule for customers
    const hoursUntilStart = (booking.startAt.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilStart < 24) {
      throw new ValidationError('Cannot cancel booking less than 24 hours before start time');
    }
  }

  await db.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledBy: req.user?.email ?? 'system'
    }
  });

  logger.info('Booking cancelled', {
    bookingId: id,
    cancelledBy: req.user?.email ?? 'system',
    customerEmail: booking.customerEmail
  });

  // TODO: Notify waiting list customers

  res.status(204).send();
}));

/**
 * Admin: List bookings with filters
 */
router.get('/api/admin/bookings', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const querySchema = z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    staffId: z.string().optional(),
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
    page: z.string().optional().transform(val => parseInt(val || '1') || 1),
    limit: z.string().optional().transform(val => Math.min(parseInt(val || '20') || 20, 100))
  });

  const queryData = querySchema.parse(req.query);
  const { from, to, staffId, status, page, limit } = queryData;

  const t = tenantId(req);
  const where: BookingWhere = { tenantId: t };

  if (from || to) {
    where.startAt = {};
    if (from) where.startAt.gte = new Date(from);
    if (to) where.startAt.lte = new Date(to);
  }
  if (staffId) where.staffId = staffId;
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        service: { select: { name: true, durationMin: true } },
        staff: { select: { name: true } }
      },
      orderBy: { startAt: 'asc' }
    }),
    db.booking.count({ where })
  ]);

  res.json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * Admin: Create booking
 */
router.post('/api/admin/bookings', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { serviceId, staffId, customerEmail, start } = validateBody(
    bookingSchema.extend({
      customerEmail: emailSchema // Admin can book for any email
    }),
    req.body
  );

  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  const service = await tenantDb.findService(serviceId); // Admin can book inactive services
  const staff = await tenantDb.findStaff(staffId); // Admin can book with inactive staff

  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + service.durationMin * 60000);

  // Check for conflicts
  const hasConflict = await tenantDb.hasBookingConflict(staffId, startDate, endDate);
  if (hasConflict) {
    throw new ConflictError('Time slot is already booked');
  }

  const booking = await db.booking.create({
    data: {
      tenantId: t,
      serviceId,
      staffId,
      customerEmail,
      startAt: startDate,
      endAt: endDate,
      status: 'CONFIRMED',
      createdBy: req.user?.email ?? null
    }
  });

  logger.info('Booking created by admin', {
    bookingId: booking.id,
    customerEmail,
    serviceId,
    staffId,
    createdBy: req.user?.email
  });

  res.status(201).json(booking);
}));

/**
 * Admin: Cancel/Delete booking
 */
router.delete('/api/admin/bookings/:id', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  const booking = await tenantDb.findBooking(id);

  await db.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledBy: req.user?.email ?? 'admin'
    }
  });

  logger.info('Booking cancelled by admin', {
    bookingId: id,
    cancelledBy: req.user?.email,
    customerEmail: booking.customerEmail
  });

  // TODO: Notify waiting list customers

  res.status(204).send();
}));

export default router;
