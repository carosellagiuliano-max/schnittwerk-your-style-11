/**
 * Validation utilities for form data and API inputs
 */

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Ungültige E-Mail-Adresse');
export const phoneSchema = z.string().regex(/^[+]?[0-9\s\-()]+$/, 'Ungültige Telefonnummer').optional();
export const requiredStringSchema = z.string().min(1, 'Dieses Feld ist erforderlich');
export const positiveNumberSchema = z.number().positive('Muss eine positive Zahl sein');
export const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültiges Zeitformat (HH:MM)');

// Service validation
export const serviceSchema = z.object({
  name: requiredStringSchema,
  durationMin: positiveNumberSchema,
  priceCents: positiveNumberSchema,
  category: z.string().optional(),
  active: z.boolean().default(true)
});

// Staff validation
export const staffSchema = z.object({
  name: requiredStringSchema,
  email: emailSchema.optional(),
  phone: phoneSchema,
  active: z.boolean().default(true),
  imageUrl: z.string().url().optional()
});

// Schedule validation
export const scheduleSchema = z.object({
  weekday: z.number().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema,
  isAvailable: z.boolean().default(true)
}).refine(data => data.startTime < data.endTime, {
  message: 'Startzeit muss vor Endzeit liegen',
  path: ['endTime']
});

// Booking validation
export const bookingSchema = z.object({
  customerId: requiredStringSchema,
  staffId: requiredStringSchema,
  serviceId: requiredStringSchema,
  date: z.date(),
  startTime: timeSchema,
  notes: z.string().optional()
});

// Customer validation
export const customerSchema = z.object({
  email: emailSchema,
  name: z.string().optional(),
  phone: phoneSchema,
  notes: z.string().optional()
});

// Notification validation
export const notificationTemplateSchema = z.object({
  name: requiredStringSchema,
  type: z.enum(['email', 'sms', 'push']),
  event: z.enum(['booking_confirmed', 'booking_reminder', 'booking_cancelled', 'waitlist_available']),
  subject: z.string().optional(),
  bodyText: requiredStringSchema,
  bodyHtml: z.string().optional(),
  active: z.boolean().default(true)
});

// Time-off validation
export const timeOffSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datumsformat'),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datumsformat'),
  reason: z.string().optional()
}).refine(data => data.dateFrom <= data.dateTo, {
  message: 'Startdatum muss vor Enddatum liegen',
  path: ['dateTo']
});

// Business settings validation
export const businessSettingsSchema = z.object({
  businessName: z.string().optional(),
  address: z.string().optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Ungültige Hex-Farbe').optional(),
  timezone: z.string().optional(),
  currency: z.string().optional()
});

// Helper functions for validation
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Unbekannter Validierungsfehler' } };
  }
}

// Type guards
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

export function isValidTime(time: string): boolean {
  return timeSchema.safeParse(time).success;
}

// Form validation hooks
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validateFormData(schema, data),
    schema
  };
}

// Business logic validators
export function validateBookingTime(date: Date, startTime: string, durationMin: number): {
  valid: boolean;
  error?: string;
} {
  const now = new Date();
  const bookingDate = new Date(date);
  
  // Check if booking is in the past
  if (bookingDate < now) {
    return { valid: false, error: 'Buchungen in der Vergangenheit sind nicht möglich' };
  }
  
  // Check if booking is too far in the future (e.g., 90 days)
  const maxAdvanceDate = new Date();
  maxAdvanceDate.setDate(now.getDate() + 90);
  if (bookingDate > maxAdvanceDate) {
    return { valid: false, error: 'Buchungen sind nur bis zu 90 Tage im Voraus möglich' };
  }
  
  // Validate time format
  if (!isValidTime(startTime)) {
    return { valid: false, error: 'Ungültiges Zeitformat' };
  }
  
  // Check business hours (simplified - would need actual business hours)
  const [hours, minutes] = startTime.split(':').map(Number);
  if (hours < 8 || hours > 20) {
    return { valid: false, error: 'Termine sind nur zwischen 08:00 und 20:00 Uhr möglich' };
  }
  
  return { valid: true };
}

export function validateScheduleOverlap(
  newSchedule: { weekday: number; startTime: string; endTime: string },
  existingSchedules: Array<{ weekday: number; startTime: string; endTime: string }>
): { valid: boolean; error?: string } {
  const overlapping = existingSchedules.find(existing => {
    if (existing.weekday !== newSchedule.weekday) return false;
    
    const newStart = timeToMinutes(newSchedule.startTime);
    const newEnd = timeToMinutes(newSchedule.endTime);
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);
    
    return (newStart < existingEnd && newEnd > existingStart);
  });
  
  if (overlapping) {
    return { 
      valid: false, 
      error: `Überschneidung mit bestehenden Arbeitszeiten (${overlapping.startTime} - ${overlapping.endTime})` 
    };
  }
  
  return { valid: true };
}

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Date validation helpers
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6; // Monday to Saturday
}

export function isWithinBusinessHours(time: string): boolean {
  const minutes = timeToMinutes(time);
  return minutes >= 480 && minutes <= 1200; // 8:00 to 20:00
}

// Password validation (for future auth features)
export const passwordSchema = z.string()
  .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Passwort muss Groß-, Kleinbuchstaben und eine Zahl enthalten');

// File upload validation
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Datei ist zu groß (max. 10MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Dateityp nicht unterstützt (nur JPEG, PNG, WebP, GIF)' };
  }
  
  return { valid: true };
}
