import express from 'express';
import { db } from '../lib/db.js';
import { z } from 'zod';
import { addDays, addWeeks, addMonths, format, startOfDay } from 'date-fns';

const router = express.Router();

const recurringBookingSchema = z.object({
  serviceId: z.string(),
  staffId: z.string(),
  customerEmail: z.string().email(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  dayOfWeek: z.number().min(1).max(7).optional(),
  timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  maxOccurrences: z.number().min(1).max(52).optional()
});

const groupBookingSchema = z.object({
  serviceId: z.string(),
  staffId: z.string(),
  primaryEmail: z.string().email(),
  groupName: z.string().optional(),
  startAt: z.string().transform(str => new Date(str)),
  maxParticipants: z.number().min(2).max(20),
  pricePerPerson: z.number().min(0),
  specialRequests: z.string().optional(),
  participants: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional()
  })).min(1)
});

const earlierAppointmentSchema = z.object({
  currentBookingId: z.string(),
  desiredDate: z.string().transform(str => new Date(str)).optional(),
  flexibleTiming: z.boolean().default(true),
  priority: z.enum(['normal', 'urgent']).default('normal')
});

// Helper function to calculate next occurrence date
function calculateNextOccurrence(
  currentDate: Date,
  frequency: string,
  startDate: Date
): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'biweekly':
      return addWeeks(currentDate, 2);
    case 'monthly':
      return addMonths(currentDate, 1);
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
}

// Helper function to generate recurring instances
async function generateRecurringInstances(
  recurringBookingId: string,
  startDate: Date,
  endDate: Date | null,
  frequency: string,
  timeSlot: string,
  maxOccurrences?: number
) {
  const instances = [];
  let currentDate = startOfDay(startDate);
  let count = 0;

  // Set time for first occurrence
  const [hours, minutes] = timeSlot.split(':').map(Number);
  currentDate.setHours(hours, minutes, 0, 0);

  while (
    (!endDate || currentDate <= endDate) &&
    (!maxOccurrences || count < maxOccurrences) &&
    count < 100 // Safety limit
  ) {
    instances.push({
      recurringBookingId,
      scheduledDate: new Date(currentDate),
      status: 'scheduled'
    });

    currentDate = calculateNextOccurrence(currentDate, frequency, startDate);
    count++;
  }

  return instances;
}

// Create recurring booking
router.post('/recurring', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const validatedData = recurringBookingSchema.parse(req.body);

    // Verify service and staff exist
    const [service, staff] = await Promise.all([
      db.service.findFirst({
        where: { id: validatedData.serviceId, tenantId }
      }),
      db.staff.findFirst({
        where: { id: validatedData.staffId, tenantId }
      })
    ]);

    if (!service || !staff) {
      return res.status(404).json({ error: 'Service or staff not found' });
    }

    // Create recurring booking
    const recurringBooking = await db.recurringBooking.create({
      data: {
        tenantId,
        serviceId: validatedData.serviceId,
        staffId: validatedData.staffId,
        customerEmail: validatedData.customerEmail,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        frequency: validatedData.frequency,
        dayOfWeek: validatedData.dayOfWeek,
        timeSlot: validatedData.timeSlot,
        maxOccurrences: validatedData.maxOccurrences,
        createdBy: req.headers['x-user-email'] as string
      }
    });

    // Generate instances
    const instances = await generateRecurringInstances(
      recurringBooking.id,
      validatedData.startDate,
      validatedData.endDate || null,
      validatedData.frequency,
      validatedData.timeSlot,
      validatedData.maxOccurrences
    );

    if (instances.length > 0) {
      await db.recurringInstance.createMany({
        data: instances
      });
    }

    res.json({
      ...recurringBooking,
      instanceCount: instances.length
    });

  } catch (error) {
    console.error('Recurring booking creation error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Recurring booking creation failed' 
    });
  }
});

// Get recurring bookings
router.get('/recurring', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { customerEmail, status, page = '1', limit = '20' } = req.query;

    const where = {
      tenantId,
      ...(customerEmail && { customerEmail: customerEmail as string }),
      ...(status && { status: status as string })
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [recurringBookings, total] = await Promise.all([
      db.recurringBooking.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          service: true,
          staff: true,
          instances: {
            orderBy: { scheduledDate: 'asc' },
            take: 5 // Show next 5 instances
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.recurringBooking.count({ where })
    ]);

    res.json({
      recurringBookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Recurring bookings retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve recurring bookings' });
  }
});

// Update recurring booking status
router.patch('/recurring/:id/status', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { status } = req.body;

    if (!['active', 'paused', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.recurringBooking.updateMany({
      where: {
        id: req.params.id,
        tenantId
      },
      data: { status }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Recurring booking not found' });
    }

    res.json({ message: 'Status updated successfully' });

  } catch (error) {
    console.error('Recurring booking status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Create group booking
router.post('/group', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const validatedData = groupBookingSchema.parse(req.body);

    // Verify service and staff exist
    const [service, staff] = await Promise.all([
      db.service.findFirst({
        where: { id: validatedData.serviceId, tenantId }
      }),
      db.staff.findFirst({
        where: { id: validatedData.staffId, tenantId }
      })
    ]);

    if (!service || !staff) {
      return res.status(404).json({ error: 'Service or staff not found' });
    }

    // Calculate end time based on service duration
    const endAt = new Date(validatedData.startAt.getTime() + service.durationMin * 60000);

    // Create group booking
    const groupBooking = await db.groupBooking.create({
      data: {
        tenantId,
        serviceId: validatedData.serviceId,
        staffId: validatedData.staffId,
        primaryEmail: validatedData.primaryEmail,
        groupName: validatedData.groupName,
        startAt: validatedData.startAt,
        endAt,
        maxParticipants: validatedData.maxParticipants,
        pricePerPerson: validatedData.pricePerPerson,
        specialRequests: validatedData.specialRequests,
        createdBy: req.headers['x-user-email'] as string
      }
    });

    // Add participants
    if (validatedData.participants.length > 0) {
      await db.groupBookingParticipant.createMany({
        data: validatedData.participants.map(participant => ({
          groupBookingId: groupBooking.id,
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          status: 'confirmed'
        }))
      });

      // Update participant count
      await db.groupBooking.update({
        where: { id: groupBooking.id },
        data: { currentParticipants: validatedData.participants.length }
      });
    }

    res.json(groupBooking);

  } catch (error) {
    console.error('Group booking creation error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Group booking creation failed' 
    });
  }
});

// Get group bookings
router.get('/group', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { primaryEmail, status, page = '1', limit = '20' } = req.query;

    const where = {
      tenantId,
      ...(primaryEmail && { primaryEmail: primaryEmail as string }),
      ...(status && { status: status as string })
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [groupBookings, total] = await Promise.all([
      db.groupBooking.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          service: true,
          staff: true,
          participants: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.groupBooking.count({ where })
    ]);

    res.json({
      groupBookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Group bookings retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve group bookings' });
  }
});

// Request earlier appointment
router.post('/earlier-appointment', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const validatedData = earlierAppointmentSchema.parse(req.body);

    // Verify current booking exists
    const currentBooking = await db.booking.findFirst({
      where: {
        id: validatedData.currentBookingId,
        tenantId
      }
    });

    if (!currentBooking) {
      return res.status(404).json({ error: 'Current booking not found' });
    }

    // Check if request already exists
    const existingRequest = await db.earlierAppointmentRequest.findFirst({
      where: {
        tenantId,
        currentBookingId: validatedData.currentBookingId,
        status: 'active'
      }
    });

    if (existingRequest) {
      return res.status(409).json({ error: 'Earlier appointment request already exists' });
    }

    // Create earlier appointment request
    const request = await db.earlierAppointmentRequest.create({
      data: {
        tenantId,
        customerEmail: currentBooking.customerEmail,
        currentBookingId: validatedData.currentBookingId,
        desiredDate: validatedData.desiredDate,
        flexibleTiming: validatedData.flexibleTiming,
        priority: validatedData.priority,
        expiresAt: validatedData.desiredDate || addDays(new Date(), 30)
      }
    });

    res.json(request);

  } catch (error) {
    console.error('Earlier appointment request error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Earlier appointment request failed' 
    });
  }
});

// Get earlier appointment requests
router.get('/earlier-appointment', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { customerEmail, status, page = '1', limit = '20' } = req.query;

    const where = {
      tenantId,
      ...(customerEmail && { customerEmail: customerEmail as string }),
      ...(status && { status: status as string })
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      db.earlierAppointmentRequest.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      db.earlierAppointmentRequest.count({ where })
    ]);

    res.json({
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Earlier appointment requests retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

export default router;
