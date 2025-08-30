import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { tenantId, requireRole } from '../lib/guards.js';
import { logger } from '../lib/logger.js';
import { asyncHandler } from '../lib/middleware.js';
import { createTenantDb } from '../lib/db-helpers.js';
import { serviceSchema, validateBody } from '../lib/validation.js';
import { 
  ValidationError, 
  ConflictError, 
  NotFoundError 
} from '../lib/errors.js';

const router = Router();

/**
 * Public: Get active services
 */
router.get('/api/services', asyncHandler(async (req, res) => {
  const services = await db.service.findMany({
    where: { 
      tenantId: tenantId(req), 
      active: true 
    },
    orderBy: { name: 'asc' }
  });

  res.json(services);
}));

/**
 * Admin: List all services
 */
router.get('/api/admin/services', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const services = await db.service.findMany({
    where: { tenantId: tenantId(req) },
    orderBy: { name: 'asc' }
  });

  res.json(services);
}));

/**
 * Admin: Create service
 */
router.post('/api/admin/services', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { name, durationMin, priceCents, category, active } = validateBody(serviceSchema, req.body);
  const t = tenantId(req);

  // Check for duplicate name
  const existingService = await db.service.findFirst({
    where: { tenantId: t, name }
  });

  if (existingService) {
    throw new ConflictError('Service with this name already exists');
  }

  const service = await db.service.create({
    data: {
      tenantId: t,
      name,
      durationMin,
      priceCents,
      category: category || null,
      active: active ?? true
    }
  });

  logger.info('Service created', {
    serviceId: service.id,
    name: service.name,
    createdBy: req.user?.email
  });

  res.status(201).json(service);
}));

/**
 * Admin: Update service
 */
router.put('/api/admin/services/:id', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, durationMin, priceCents, category, active } = validateBody(
    serviceSchema.partial(),
    req.body
  );
  
  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  // Find existing service
  const existingService = await tenantDb.findService(id);

  // Check for duplicate name (if name is being changed)
  if (name && name !== existingService.name) {
    const duplicateService = await db.service.findFirst({
      where: { tenantId: t, name }
    });

    if (duplicateService) {
      throw new ConflictError('Service with this name already exists');
    }
  }

  const updatedService = await db.service.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(durationMin && { durationMin }),
      ...(priceCents !== undefined && { priceCents }),
      ...(category !== undefined && { category }),
      ...(active !== undefined && { active })
    }
  });

  logger.info('Service updated', {
    serviceId: id,
    updatedBy: req.user?.email,
    changes: Object.keys(req.body)
  });

  res.json(updatedService);
}));

/**
 * Admin: Delete service (only if not in use)
 */
router.delete('/api/admin/services/:id', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  // Find service
  const service = await tenantDb.findService(id);

  // Check if service is in use
  const activeBooking = await db.booking.findFirst({
    where: { 
      serviceId: id, 
      status: 'CONFIRMED' 
    }
  });

  if (activeBooking) {
    throw new ValidationError('Cannot delete service that has active bookings');
  }

  await db.service.delete({ where: { id } });

  logger.info('Service deleted', {
    serviceId: id,
    serviceName: service.name,
    deletedBy: req.user?.email
  });

  res.status(204).send();
}));

export default router;
