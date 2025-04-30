
import { useState, useCallback } from 'react';
import { ApiResponse, ApiRequestConfig } from '@/services/api/api-core';
import { errorService, type ErrorState } from "@/utils/error";

interface UseApiRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ErrorState) => void;
  initialData?: any;
  loadingDelay?: number;
  errorMessage?: string;
}

/**
 * Hook for handling API requests with loading and error states
 */
export function useApiRequest<T = any>(options: UseApiRequestOptions = {}) {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);

  // For delayed loading indicators to prevent flicker
  let loadingTimer: ReturnType<typeof setTimeout> | undefined;

  const execute = useCallback(async <R = T>(
    requestFn: () => Promise<R>,
    requestOptions: {
      loadingDelay?: number;
      errorMessage?: string;
    } = {}
  ): Promise<ApiResponse<R>> => {
    // Clear any previous errors
    setError(null);
    
    // Start loading after delay to prevent screen flicker for fast requests
    const delay = requestOptions.loadingDelay ?? options.loadingDelay ?? 100;
    if (delay > 0) {
      loadingTimer = setTimeout(() => setIsLoading(true), delay);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await requestFn();
      setData(result as unknown as T);
      options.onSuccess?.(result);
      return { data: result, isLoading: false, error: null };
    } catch (error) {
      const errorState = errorService.createErrorState(
        error, 
        requestOptions.errorMessage || options.errorMessage || 'Request failed'
      );
      setError(errorState);
      options.onError?.(errorState);
      return { data: null, isLoading: false, error: errorState };
    } finally {
      if (loadingTimer) clearTimeout(loadingTimer);
      setIsLoading(false);
    }
  }, [options]);

  // Reset the state
  const reset = useCallback(() => {
    setData(options.initialData || null);
    setIsLoading(false);
    setError(null);
  }, [options.initialData]);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    setData
  };
}

/**
 * Hook for handling API mutations (create, update, delete)
 */
export function useApiMutation<T = any, P = any>(options: UseApiRequestOptions = {}) {
  const { execute, data, isLoading, error, reset, setData } = useApiRequest<T>(options);

  const mutate = useCallback(async (
    mutationFn: (params: P) => Promise<T>,
    params: P,
    requestOptions: {
      loadingDelay?: number;
      errorMessage?: string;
    } = {}
  ): Promise<ApiResponse<T>> => {
    return execute(() => mutationFn(params), requestOptions);
  }, [execute]);

  return {
    data,
    isLoading, 
    error,
    mutate,
    reset,
    setData
  };
}
