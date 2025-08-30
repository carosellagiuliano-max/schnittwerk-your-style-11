/**
 * Validation Utilities
 */

import { z } from 'zod';
import { ValidationError } from './errors.js';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone format').optional();
export const dateTimeSchema = z.string().datetime('Invalid datetime format');
export const positiveIntSchema = z.number().int().positive('Must be a positive integer');
export const nonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

// Tenant ID validation
export const tenantIdSchema = z.string().min(1, 'Tenant ID required');

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)) // Max 100 items per page
});

// Service validation
export const serviceSchema = z.object({
  name: nonEmptyStringSchema,
  durationMin: positiveIntSchema,
  priceCents: z.number().int().min(0, 'Price cannot be negative'),
  category: z.string().optional(),
  active: z.boolean().default(true)
});

// Staff validation
export const staffSchema = z.object({
  name: nonEmptyStringSchema,
  active: z.boolean().default(true),
  imageUrl: z.string().url().optional()
});

export const createStaffSchema = z.object({
  name: nonEmptyStringSchema,
  active: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
  services: z.array(z.string()).optional()
});

export const updateStaffSchema = createStaffSchema.partial();

// Booking validation
export const bookingSchema = z.object({
  serviceId: nonEmptyStringSchema,
  staffId: nonEmptyStringSchema,
  customerEmail: emailSchema,
  start: dateTimeSchema
});

// Schedule validation
export const scheduleSchema = z.object({
  weekday: z.number().int().min(0).max(6, 'Weekday must be 0-6'),
  startMin: z.number().int().min(0).max(1439, 'Start time must be 0-1439 minutes'),
  endMin: z.number().int().min(0).max(1439, 'End time must be 0-1439 minutes')
}).refine(data => data.startMin < data.endMin, {
  message: 'Start time must be before end time'
});

// Time-off validation
export const timeOffSchema = z.object({
  dateFrom: dateTimeSchema,
  dateTo: dateTimeSchema,
  reason: z.string().optional()
}).refine(data => new Date(data.dateFrom) < new Date(data.dateTo), {
  message: 'Start date must be before end date'
});

/**
 * Validate request body against schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      }).join(', ');
      throw new ValidationError(`Validation failed: ${messages}`);
    }
    throw error;
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): T {
  return schema.parse(query);
}

/**
 * Safe validation that returns result with error
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorMessage = result.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    return { success: false, error: errorMessage };
  }
}
