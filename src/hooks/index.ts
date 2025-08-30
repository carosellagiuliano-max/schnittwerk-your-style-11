/**
 * Custom React hooks for common patterns in the salon management system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Generic API state hook
export function useApiState<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API call failed:', err as Error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
}

// Paginated data hook
export function usePaginatedData<T>(
  apiCall: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>,
  initialLimit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall({ page, limit });
      
      if (result.data) {
        setData(result.data);
        if (result.pagination) {
          setTotal(result.pagination.total);
          setPages(result.pagination.pages);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Paginated API call failed:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [apiCall, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    page,
    limit,
    total,
    pages,
    setPage,
    refetch: fetchData
  };
}

// Form state hook
export function useFormState<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  }, [initialData]);

  return {
    data,
    errors,
    touched,
    submitting,
    updateField,
    touchField,
    setFieldError,
    clearErrors,
    setSubmitting,
    reset,
    setData,
    setErrors
  };
}

// Async operation hook
export function useAsyncOperation<T = unknown, P = unknown>(
  operation: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation(params);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Async operation failed:', err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [operation]);

  return {
    execute,
    loading,
    error,
    data,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
}

// Local storage hook
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      logger.warn(`Error reading localStorage key "${key}":`, { error });
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}":`, error as Error);
    }
  }, [key, value]);

  return [value, setStoredValue] as const;
}

// Debounced value hook
export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Services-specific hooks
export function useServices() {
  return useApiState(() => apiService.getServices());
}

export function useStaff() {
  return useApiState(() => apiService.getStaff());
}

export function useBookings(params?: { page?: number; limit?: number }) {
  return usePaginatedData(
    ({ page, limit }) => apiService.getBookings({ ...params, page, limit })
  );
}

export function useCustomers(params?: { page?: number; limit?: number }) {
  return usePaginatedData(
    ({ page, limit }) => apiService.getCustomers({ ...params, page, limit })
  );
}

// Service creation hook
export function useCreateService() {
  return useAsyncOperation(async (data: unknown) => {
    const result = await apiService.createService(data);
    if (!result) throw new Error('Service creation failed');
    return result;
  });
}

// Staff creation hook
export function useCreateStaff() {
  return useAsyncOperation(async (data: unknown) => {
    const result = await apiService.createStaff(data);
    if (!result) throw new Error('Staff creation failed');
    return result;
  });
}

// Booking creation hook
export function useCreateBooking() {
  return useAsyncOperation(async (data: unknown) => {
    const result = await apiService.createBooking(data);
    if (!result) throw new Error('Booking creation failed');
    return result;
  });
}

// File upload hook
export function useFileUpload() {
  return useAsyncOperation(async ({ file, category, entityId }: { 
    file: File; 
    category: string; 
    entityId?: string; 
  }) => {
    const result = await apiService.uploadFile(file, category, entityId);
    if (!result) throw new Error('File upload failed');
    return result;
  });
}

// Modal state hook
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
}

// Search/filter hook
export function useSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  initialQuery = ''
) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounced(query, 300);

  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) return data;

    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedQuery.toLowerCase());
        }
        return false;
      })
    );
  }, [data, searchFields, debouncedQuery]);

  return {
    query,
    setQuery,
    filteredData,
    hasQuery: debouncedQuery.trim().length > 0
  };
}

// Window size hook
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
