/**
 * Core Types for the Salon Management System
 */

// Base Entity
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Tenant
export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  plan: string;
  theme?: string;
}

// User & Authentication
export interface User {
  role: 'owner' | 'admin' | 'staff' | 'customer';
  email: string;
  fullName?: string;
  phone?: string;
}

export interface Profile extends BaseEntity {
  tenantId: string;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  totalRevenue: number;
  status: 'neu' | 'bronze' | 'silber' | 'gold' | 'diamant';
}

// Services
export interface Service extends BaseEntity {
  tenantId: string;
  name: string;
  durationMin: number;
  priceCents: number;
  category?: string;
  active: boolean;
}

export interface ServiceFormData {
  name: string;
  durationMin: number;
  priceCents: number;
  category?: string;
  active?: boolean;
}

// Staff
export interface Staff extends BaseEntity {
  tenantId: string;
  name: string;
  active: boolean;
  imageUrl?: string;
}

export interface StaffFormData {
  name: string;
  active?: boolean;
  imageUrl?: string;
}

// Schedules
export interface Schedule extends BaseEntity {
  tenantId: string;
  staffId: string;
  weekday: number; // 0=Monday, 6=Sunday
  startMin: number;
  endMin: number;
}

export interface ScheduleFormData {
  weekday: number;
  startMin: number;
  endMin: number;
}

// Time Off
export interface TimeOff extends BaseEntity {
  tenantId: string;
  staffId: string;
  dateFrom: string;
  dateTo: string;
  reason?: string;
}

export interface TimeOffFormData {
  dateFrom: string;
  dateTo: string;
  reason?: string;
}

// Bookings
export interface Booking extends BaseEntity {
  tenantId: string;
  serviceId: string;
  staffId: string;
  customerEmail: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdBy?: string;
  cancelledBy?: string;
  
  // Relations (when included)
  service?: Pick<Service, 'name' | 'durationMin'>;
  staff?: Pick<Staff, 'name'>;
}

export interface BookingFormData {
  serviceId: string;
  staffId: string;
  customerEmail: string;
  start: string;
}

// Customer Management
export interface CustomerBan extends BaseEntity {
  tenantId: string;
  email: string;
  reason?: string;
}

export interface Customer {
  email: string;
  fullName?: string;
  phone?: string;
  totalRevenue: number;
  status: Profile['status'];
  lastBooking?: string;
  totalBookings: number;
  isBanned: boolean;
}

// Waiting List
export interface WaitingListEntry extends BaseEntity {
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  serviceId: string;
  preferredDate: string;
  preferredTime?: string;
  flexible: boolean;
  priority: 'low' | 'medium' | 'high';
  
  // Relations
  service?: Pick<Service, 'name'>;
}

// Advanced Booking Features
export interface RecurringBooking extends BaseEntity {
  tenantId: string;
  serviceId: string;
  staffId: string;
  customerEmail: string;
  startDate: string;
  endDate?: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number;
  timeSlot: string;
  maxOccurrences?: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdBy?: string;
}

export interface GroupBooking extends BaseEntity {
  tenantId: string;
  serviceId: string;
  staffId: string;
  primaryEmail: string;
  groupName?: string;
  startAt: string;
  endAt: string;
  maxParticipants: number;
  currentParticipants: number;
  pricePerPerson: number;
  status: 'open' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdBy?: string;
}

export interface GroupBookingParticipant extends BaseEntity {
  groupBookingId: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Media Management
export interface MediaFile extends BaseEntity {
  tenantId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  category: 'service' | 'staff' | 'gallery' | 'product';
  entityId?: string;
  altText?: string;
  isPublic: boolean;
  uploadedBy?: string;
}

// Notifications
export interface NotificationTemplate extends BaseEntity {
  tenantId: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  event: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'waitlist_available' | 'earlier_appointment_available';
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  active: boolean;
}

export interface NotificationLog extends BaseEntity {
  tenantId: string;
  recipient: string;
  type: 'email' | 'sms' | 'push';
  event: string;
  subject?: string;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: string;
  deliveredAt?: string;
  errorMsg?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form States
export interface FormState<T> {
  data: T;
  loading: boolean;
  error?: string;
  success?: boolean;
}

// Calendar & Time
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  stylist?: string;
  booking?: Booking;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string; // staff ID
  booking?: Booking;
  backgroundColor?: string;
  borderColor?: string;
}

// Business Settings
export interface BusinessSettings {
  allowOnlineBooking: boolean;
  enableWaitingList: boolean;
  autoConfirmBookings: boolean;
  sendEmailNotifications: boolean;
  sendSmsNotifications: boolean;
  requireDeposit: boolean;
  cancellationDeadline: number; // hours
  maxAdvanceBooking: number; // days
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

// Chart & Analytics
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface RevenueData {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
  total: number;
  growth: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}
