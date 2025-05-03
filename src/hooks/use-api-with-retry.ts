
import { useState, useCallback } from 'react';
import { errorService } from '@/utils/error';
import { useRetry } from '@/hooks/use-retry';
import { toast } from '@/hooks/use-toast';
import type { ErrorState } from '@/utils/error/errorTypes';

interface UseApiWithRetryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ErrorState) => void;
  initialData?: T | null;
  executeOnMount?: boolean;
  retryOptions?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    showToastOnRetry?: boolean;
  };
}

/**
 * Enhanced API hook with automatic retry functionality
 */
export function useApiWithRetry<T>(
  apiFunction: () => Promise<T>,
  options: UseApiWithRetryOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(options.executeOnMount !== false);
  const [error, setError] = useState<ErrorState | null>(null);

  const { 
    retryOptions = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      showToastOnRetry: true
    }
  } = options;

  const retryHandler = useRetry(apiFunction, {
    maxRetries: retryOptions.maxRetries,
    initialDelay: retryOptions.initialDelay,
    maxDelay: retryOptions.maxDelay,
    onRetry: (attempt, delay) => {
      if (retryOptions.showToastOnRetry) {
        toast({
          title: `Retrying... (${attempt}/${retryOptions.maxRetries})`,
          description: `Next attempt in ${Math.round(delay / 1000)}s`,
          variant: "default",
        });
      }
    }
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorState = errorService.createErrorState(err);
      setError(errorState);
      options.onError?.(errorState);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, options]);

  const retryRequest = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    const result = await retryHandler.retry();
    
    if (result !== null) {
      setData(result);
      options.onSuccess?.(result);
    } else if (retryHandler.error) {
      const errorState = errorService.createErrorState(retryHandler.error);
      setError(errorState);
      options.onError?.(errorState);
    }
    
    setIsLoading(false);
    return result;
  }, [retryHandler, options]);

  // Execute on mount if specified
  useState(() => {
    if (options.executeOnMount !== false) {
      execute();
    }
  });

  return {
    data,
    isLoading,
    error,
    execute,
    retry: retryRequest,
    isRetrying: retryHandler.isRetrying,
    retryCount: retryHandler.retryCount,
    reset: useCallback(() => {
      setData(options.initialData || null);
      setIsLoading(false);
      setError(null);
      retryHandler.reset();
    }, [options.initialData, retryHandler])
  };
}
