/**
 * Enhanced API Utilities with proper error handling and types
 */

import { 
  type ApiResponse, 
  type PaginatedResponse,
  type Booking,
  type BookingFormData,
  type Service,
  type ServiceFormData,
  type Staff,
  type StaffFormData,
  type Schedule,
  type ScheduleFormData,
  type TimeOff,
  type TimeOffFormData,
  type Customer
} from '@/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request Configuration
interface RequestConfig extends RequestInit {
  timeout?: number;
}

// Auth Headers for Development
function getDevHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-tenant-id': 't_dev',
    'x-user-role': 'admin',
    'x-user-email': 'admin@dev.local'
  };
}

// Enhanced fetch with timeout and error handling
async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { timeout = 10000, ...fetchConfig } = config;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
      headers: {
        ...getDevHeaders(),
        ...fetchConfig.headers
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: unknown;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If response is not JSON, use status text
      }

      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw new ApiError(error.message, 0);
    }

    throw new ApiError('Unknown error occurred', 0);
  }
}

// Generic API methods
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig): Promise<T> =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),

  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),

  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: <T>(endpoint: string, config?: RequestConfig): Promise<T> =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' })
};

// Higher-level API functions with specific types
export const bookingApi = {
  list: (params?: {
    from?: string;
    to?: string;
    staffId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<PaginatedResponse<Booking>>(`/api/admin/bookings${query ? `?${query}` : ''}`);
  },

  create: (data: BookingFormData) =>
    api.post<Booking>('/api/admin/bookings', data),

  cancel: (id: string) =>
    api.delete(`/api/admin/bookings/${id}`),

  getCustomerBookings: () =>
    api.get<Booking[]>('/api/bookings/me')
};

export const serviceApi = {
  list: () => api.get<Service[]>('/api/admin/services'),
  create: (data: ServiceFormData) => api.post<Service>('/api/admin/services', data),
  update: (id: string, data: Partial<ServiceFormData>) => api.put<Service>(`/api/admin/services/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/services/${id}`)
};

export const staffApi = {
  list: () => api.get<Staff[]>('/api/admin/staff'),
  create: (data: StaffFormData) => api.post<Staff>('/api/admin/staff', data),
  update: (id: string, data: Partial<StaffFormData>) => api.put<Staff>(`/api/admin/staff/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/staff/${id}`),
  
  getSchedules: (staffId: string) => api.get<Schedule[]>(`/api/admin/staff/${staffId}/schedules`),
  addSchedule: (staffId: string, data: ScheduleFormData) => 
    api.post<Schedule>(`/api/admin/staff/${staffId}/schedules`, data),
  deleteSchedule: (staffId: string, scheduleId: string) => 
    api.delete(`/api/admin/staff/${staffId}/schedules/${scheduleId}`),
  
  getTimeOffs: (staffId: string) => api.get<TimeOff[]>(`/api/admin/staff/${staffId}/timeoff`),
  addTimeOff: (staffId: string, data: TimeOffFormData) => 
    api.post<TimeOff>(`/api/admin/staff/${staffId}/timeoff`, data),
  deleteTimeOff: (staffId: string, timeOffId: string) => 
    api.delete(`/api/admin/staff/${staffId}/timeoff/${timeOffId}`)
};

export const customerApi = {
  search: (query: string) => 
    api.get<Customer[]>(`/api/admin/customers?q=${encodeURIComponent(query)}`),
  ban: (email: string, reason?: string) => 
    api.post('/api/admin/customers/ban', { email, reason }),
  unban: (email: string) => 
    api.delete('/api/admin/customers/ban', { body: JSON.stringify({ email }) })
};

// Utility functions for data processing
export function formatCurrency(cents: number, currency = 'CHF'): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currency === 'CHF' ? 'CHF' : 'EUR',
    minimumFractionDigits: 2
  }).format(cents / 100);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} Min`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('de-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('de-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(dateString));
}

export function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat('de-CH', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

// Status badge helpers
export function getBookingStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getCustomerStatusColor(status: string): string {
  switch (status) {
    case 'neu':
      return 'bg-blue-100 text-blue-800';
    case 'bronze':
      return 'bg-orange-100 text-orange-800';
    case 'silber':
      return 'bg-gray-100 text-gray-800';
    case 'gold':
      return 'bg-yellow-100 text-yellow-800';
    case 'diamant':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Error handling utilities
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Loading states for components
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export function createLoadingState(): LoadingState {
  return { loading: false, error: null };
}

export function setLoading(state: LoadingState, loading: boolean): LoadingState {
  return { ...state, loading, error: loading ? null : state.error };
}

export function setError(state: LoadingState, error: string): LoadingState {
  return { ...state, loading: false, error };
}

export function clearError(state: LoadingState): LoadingState {
  return { ...state, error: null };
}
