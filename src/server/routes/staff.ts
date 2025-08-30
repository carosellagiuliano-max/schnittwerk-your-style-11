import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { tenantId, requireRole } from '../lib/guards.js';
import { logger } from '../lib/logger.js';
import { asyncHandler } from '../lib/middleware.js';
import { createTenantDb } from '../lib/db-helpers.js';
import { staffSchema, validateBody } from '../lib/validation.js';
import { 
  ValidationError, 
  ConflictError 
} from '../lib/errors.js';

const router = Router();

// Extended staff schema with services
const createStaffSchema = staffSchema.extend({
  services: z.array(z.string()).optional()
});

const updateStaffSchema = staffSchema.partial().extend({
  services: z.array(z.string()).optional()
});

/**
 * Admin: List all staff with their service assignments
 */
router.get('/api/admin/staff', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const staff = await db.staff.findMany({
    where: { tenantId: tenantId(req) },
    orderBy: { name: 'asc' },
    include: { 
      serviceLinks: {
        include: {
          service: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });

  res.json(staff);
}));

/**
 * Admin: Create staff member
 */
router.post('/api/admin/staff', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { name, imageUrl, active, services } = validateBody(createStaffSchema, req.body);
  const t = tenantId(req);

  // Create staff member
  const staff = await db.staff.create({
    data: {
      tenantId: t,
      name,
      imageUrl: imageUrl || null,
      active: active ?? true
    }
  });

  // Link services if provided
  if (services && services.length > 0) {
    // Validate that all services exist and belong to tenant
    const validServices = await db.service.findMany({
      where: {
        id: { in: services },
        tenantId: t
      }
    });

    if (validServices.length !== services.length) {
      throw new ValidationError('Some services do not exist or do not belong to this tenant');
    }

    await db.staffService.createMany({
      data: services.map(serviceId => ({
        staffId: staff.id,
        serviceId,
        tenantId: t
      }))
    });
  }

  logger.info('Staff member created', {
    staffId: staff.id,
    name: staff.name,
    servicesCount: services?.length || 0,
    createdBy: req.user?.email
  });

  res.status(201).json(staff);
}));

/**
 * Admin: Update staff member
 */
router.put('/api/admin/staff/:id', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, active, imageUrl, services } = validateBody(updateStaffSchema, req.body);
  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  // Find existing staff
  const existingStaff = await tenantDb.findStaff(id);

  // Update staff member
  const updatedStaff = await db.staff.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(active !== undefined && { active }),
      ...(imageUrl !== undefined && { imageUrl })
    }
  });

  // Update service assignments if provided
  if (services !== undefined) {
    // Remove existing assignments
    await db.staffService.deleteMany({
      where: { staffId: id }
    });

    // Add new assignments
    if (services.length > 0) {
      // Validate services
      const validServices = await db.service.findMany({
        where: {
          id: { in: services },
          tenantId: t
        }
      });

      if (validServices.length !== services.length) {
        throw new ValidationError('Some services do not exist or do not belong to this tenant');
      }

      await db.staffService.createMany({
        data: services.map(serviceId => ({
          staffId: id,
          serviceId,
          tenantId: t
        }))
      });
    }
  }

  logger.info('Staff member updated', {
    staffId: id,
    updatedBy: req.user?.email,
    changes: Object.keys(req.body)
  });

  res.json(updatedStaff);
}));

/**
 * Admin: Delete staff member (only if not in use)
 */
router.delete('/api/admin/staff/:id', requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const t = tenantId(req);
  const tenantDb = createTenantDb(t);

  // Find staff
  const staff = await tenantDb.findStaff(id);

  // Check if staff has active bookings
  const activeBooking = await db.booking.findFirst({
    where: { 
      staffId: id, 
      status: 'CONFIRMED' 
    }
  });

  if (activeBooking) {
    throw new ValidationError('Cannot delete staff member who has active bookings');
  }

  await db.staff.delete({ where: { id } });

  logger.info('Staff member deleted', {
    staffId: id,
    staffName: staff.name,
    deletedBy: req.user?.email
  });

  res.status(204).send();
}));

/**
 * Public: Get active staff for customers
 */
router.get('/api/staff', asyncHandler(async (req, res) => {
  const staff = await db.staff.findMany({
    where: { 
      tenantId: tenantId(req), 
      active: true 
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      serviceLinks: {
        include: {
          service: {
            select: { id: true, name: true, active: true }
          }
        },
        where: {
          service: { active: true }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.json(staff);
}));

export default router;
