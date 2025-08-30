/**
 * Enhanced API client with better error handling and TypeScript support
 */

import { logger } from './logger';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Service,
  ServiceFormData,
  Staff, 
  StaffFormData,
  Booking,
  BookingFormData,
  Customer,
  MediaFile,
  NotificationLog
} from '@/types';

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

// Default configuration
const defaultConfig: ApiConfig = {
  baseUrl: '',
  timeout: 10000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    'x-user-role': 'admin',
    'x-user-email': 'admin@dev.local'
  }
};

class ApiClient {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = this.config.timeout, retries = this.config.retries, ...requestOptions } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
        headers: {
          ...this.config.headers,
          ...requestOptions.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorText;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        
        // Retry logic for network errors
        if (retries && retries > 0 && this.shouldRetry(error)) {
          logger.warn(`Request failed, retrying... (${retries} attempts left)`, { url, error: error.message });
          await this.delay(1000);
          return this.makeRequest(url, { ...options, retries: retries - 1 });
        }
      }

      throw error;
    }
  }

  private shouldRetry(error: Error): boolean {
    // Retry on network errors, not on client errors (4xx)
    return !error.message.includes('400') && 
           !error.message.includes('401') && 
           !error.message.includes('403') && 
           !error.message.includes('404');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    logger.debug(`GET ${path}`);
    return this.makeRequest<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    logger.debug(`POST ${path}`, data);
    return this.makeRequest<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(path: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    logger.debug(`PUT ${path}`, data);
    return this.makeRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async patch<T>(path: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    logger.debug(`PATCH ${path}`, data);
    return this.makeRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    logger.debug(`DELETE ${path}`);
    return this.makeRequest<T>(path, { ...options, method: 'DELETE' });
  }

  // Specialized methods for common patterns
  async getPaginated<T>(
    path: string, 
    params: { page?: number; limit?: number; [key: string]: unknown } = {}
  ): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const url = searchParams.toString() ? `${path}?${searchParams}` : path;
    return this.get<PaginatedResponse<T>>(url);
  }

  async upload(path: string, file: File, additionalData?: Record<string, string>): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    logger.debug(`UPLOAD ${path}`, { fileName: file.name, size: file.size });

    return this.makeRequest<ApiResponse>(path, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        'x-user-role': this.config.headers?.['x-user-role'] || 'admin',
        'x-user-email': this.config.headers?.['x-user-email'] || 'admin@dev.local'
      }
    });
  }
}

// Create default client instance
const apiClient = new ApiClient();

// Export the legacy api function for backward compatibility
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method || 'GET';
  const data = init.body ? JSON.parse(init.body as string) : undefined;

  switch (method.toUpperCase()) {
    case 'GET':
      return apiClient.get<T>(path, init);
    case 'POST':
      return apiClient.post<T>(path, data, init);
    case 'PUT':
      return apiClient.put<T>(path, data, init);
    case 'PATCH':
      return apiClient.patch<T>(path, data, init);
    case 'DELETE':
      return apiClient.delete<T>(path, init);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

// Export the enhanced client
export { apiClient };

// Export specialized API functions  
export const apiService = {
  // Services
  getServices: () => apiClient.get<ApiResponse<Array<Service>>>('/api/admin/services'),
  createService: (data: ServiceFormData) => apiClient.post<ApiResponse>('/api/admin/services', data),
  updateService: (id: string, data: Partial<ServiceFormData>) => apiClient.put<ApiResponse>(`/api/admin/services/${id}`, data),
  deleteService: (id: string) => apiClient.delete<ApiResponse>(`/api/admin/services/${id}`),

  // Staff
  getStaff: () => apiClient.get<ApiResponse<Array<Staff>>>('/api/admin/staff'),
  createStaff: (data: StaffFormData) => apiClient.post<ApiResponse>('/api/admin/staff', data),
  updateStaff: (id: string, data: Partial<StaffFormData>) => apiClient.put<ApiResponse>(`/api/admin/staff/${id}`, data),
  deleteStaff: (id: string) => apiClient.delete<ApiResponse>(`/api/admin/staff/${id}`),

  // Bookings
  getBookings: (params?: Record<string, unknown>) => apiClient.getPaginated<Booking>('/api/admin/bookings', params),
  createBooking: (data: BookingFormData) => apiClient.post<ApiResponse>('/api/admin/bookings', data),
  updateBooking: (id: string, data: Partial<BookingFormData>) => apiClient.put<ApiResponse>(`/api/admin/bookings/${id}`, data),
  cancelBooking: (id: string, reason?: string) => apiClient.patch<ApiResponse>(`/api/admin/bookings/${id}/cancel`, { reason }),

  // Customers
  getCustomers: (params?: Record<string, unknown>) => apiClient.getPaginated<Customer>('/api/admin/customers', params),
  createCustomer: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/admin/customers', data),
  updateCustomer: (id: string, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/admin/customers/${id}`, data),

  // Media
  uploadFile: (file: File, category: string, entityId?: string) => 
    apiClient.upload('/api/admin/media/upload', file, { category, ...(entityId && { entityId }) }),
  getMediaFiles: (params?: Record<string, unknown>) => apiClient.getPaginated<MediaFile>('/api/admin/media', params),
  deleteFile: (id: string) => apiClient.delete<ApiResponse>(`/api/admin/media/${id}`),

  // Notifications
  getNotifications: (params?: Record<string, unknown>) => apiClient.getPaginated<NotificationLog>('/api/admin/notifications', params),
  sendNotification: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/admin/notifications/send', data),
  markAsRead: (id: string) => apiClient.patch<ApiResponse>(`/api/admin/notifications/${id}/read`),
};
