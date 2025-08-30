/**
 * Database Helper Functions
 */

import { db } from './db.js';
import { NotFoundError, DatabaseError } from './errors.js';
import { logger } from './logger.js';

/**
 * Generic database operation wrapper with error handling
 */
export async function dbOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`Database operation failed: ${operationName}`, error as Error, context);
    throw new DatabaseError(`${operationName} failed`, error as Error);
  }
}

/**
 * Find entity by ID with proper error handling
 */
export async function findByIdOrThrow<T>(
  findOperation: () => Promise<T | null>,
  entityName: string,
  id: string
): Promise<T> {
  const entity = await findOperation();
  if (!entity) {
    throw new NotFoundError(entityName, id);
  }
  return entity;
}

/**
 * Check if entity exists
 */
export async function entityExists(
  findOperation: () => Promise<unknown>,
  entityName: string,
  id: string
): Promise<boolean> {
  try {
    const entity = await findOperation();
    return !!entity;
  } catch (error) {
    logger.error(`Failed to check if ${entityName} exists`, error as Error, { id });
    return false;
  }
}

/**
 * Tenant-aware database helpers
 */
export class TenantDbHelper {
  constructor(private tenantId: string) {}

  // Service operations
  async findService(serviceId: string) {
    return findByIdOrThrow(
      () => db.service.findFirst({
        where: { id: serviceId, tenantId: this.tenantId }
      }),
      'Service',
      serviceId
    );
  }

  async findActiveService(serviceId: string) {
    return findByIdOrThrow(
      () => db.service.findFirst({
        where: { id: serviceId, tenantId: this.tenantId, active: true }
      }),
      'Active Service',
      serviceId
    );
  }

  // Staff operations
  async findStaff(staffId: string) {
    return findByIdOrThrow(
      () => db.staff.findFirst({
        where: { id: staffId, tenantId: this.tenantId }
      }),
      'Staff',
      staffId
    );
  }

  async findActiveStaff(staffId: string) {
    return findByIdOrThrow(
      () => db.staff.findFirst({
        where: { id: staffId, tenantId: this.tenantId, active: true }
      }),
      'Active Staff',
      staffId
    );
  }

  // Booking operations
  async findBooking(bookingId: string) {
    return findByIdOrThrow(
      () => db.booking.findFirst({
        where: { id: bookingId, tenantId: this.tenantId }
      }),
      'Booking',
      bookingId
    );
  }

  // Check if customer is banned
  async isCustomerBanned(email: string): Promise<boolean> {
    const ban = await db.customerBan.findFirst({
      where: { email, tenantId: this.tenantId }
    });
    return !!ban;
  }

  // Check for booking conflicts
  async hasBookingConflict(
    staffId: string,
    startAt: Date,
    endAt: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const conflict = await db.booking.findFirst({
      where: {
        tenantId: this.tenantId,
        staffId,
        status: 'CONFIRMED',
        AND: [
          { startAt: { lt: endAt } },
          { endAt: { gt: startAt } }
        ],
        ...(excludeBookingId && { id: { not: excludeBookingId } })
      }
    });
    return !!conflict;
  }

  // Get staff working hours for a specific day
  async getStaffSchedule(staffId: string, weekday: number) {
    return db.schedule.findMany({
      where: {
        tenantId: this.tenantId,
        staffId,
        weekday
      },
      orderBy: { startMin: 'asc' }
    });
  }

  // Check if staff is available (not on time off)
  async isStaffAvailable(staffId: string, date: Date): Promise<boolean> {
    const timeOff = await db.timeOff.findFirst({
      where: {
        tenantId: this.tenantId,
        staffId,
        dateFrom: { lte: date },
        dateTo: { gte: date }
      }
    });
    return !timeOff;
  }
}

/**
 * Create tenant-aware database helper
 */
export function createTenantDb(tenantId: string): TenantDbHelper {
  return new TenantDbHelper(tenantId);
}

/**
 * Pagination helper
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function paginatedQuery<T>(
  query: (skip: number, take: number) => Promise<T[]>,
  countQuery: () => Promise<number>,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    query(skip, limit),
    countQuery()
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
