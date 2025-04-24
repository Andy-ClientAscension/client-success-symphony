
import { useState, useEffect, useCallback } from 'react';
import { errorService } from '@/utils/error';
import type { ErrorState } from '@/utils/error/errorTypes';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ErrorState) => void;
  initialData?: T | null;
  executeOnMount?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ErrorState | null;
  execute: () => Promise<void>;
  setData: (data: T | null) => void;
  reset: () => void;
}

/**
 * Custom hook for managing API requests with loading and error states
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorState = errorService.createErrorState(error);
      setError(errorState);
      options.onError?.(errorState);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setData(options.initialData || null);
    setIsLoading(false);
    setError(null);
  }, [options.initialData]);

  useEffect(() => {
    if (options.executeOnMount !== false) {
      execute();
    }
  }, [execute, options.executeOnMount]);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
    reset
  };
}

/**
 * Hook for managing API mutations (create, update, delete)
 */
export function useApiMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const mutate = async (params: P): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(params);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorState = errorService.createErrorState(error);
      setError(errorState);
      options.onError?.(errorState);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = useCallback(() => {
    setData(options.initialData || null);
    setIsLoading(false);
    setError(null);
  }, [options.initialData]);

  return {
    data,
    isLoading,
    error,
    mutate,
    reset
  };
}
