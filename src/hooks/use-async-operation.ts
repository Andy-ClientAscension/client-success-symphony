/**
 * Common Loading State Hook
 * Consolidates loading patterns with error handling and timeout support
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logging/logger';

export interface LoadingOptions {
  timeout?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  isTimedOut: boolean;
  attemptCount: number;
}

export function useAsyncOperation<T = any>(options: LoadingOptions = {}) {
  const {
    timeout = 30000,
    onSuccess,
    onError,
    onTimeout,
    retryAttempts = 0,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    isTimedOut: false,
    attemptCount: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const currentOperationRef = useRef<Promise<T> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    customOptions?: Partial<LoadingOptions>
  ): Promise<T | null> => {
    const effectiveOptions = { ...options, ...customOptions };
    
    if (!isMountedRef.current) return null;

    // Cancel previous operation
    if (currentOperationRef.current) {
      logger.info('Cancelling previous operation');
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isTimedOut: false,
      attemptCount: prev.attemptCount + 1
    }));

    // Set timeout
    if (effectiveOptions.timeout) {
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isTimedOut: true
          }));
          effectiveOptions.onTimeout?.();
          logger.warn('Operation timed out', { timeout: effectiveOptions.timeout });
        }
      }, effectiveOptions.timeout);
    }

    const executeWithRetry = async (attempt: number): Promise<T | null> => {
      try {
        const operationPromise = operation();
        currentOperationRef.current = operationPromise;
        
        const result = await operationPromise;
        
        if (!isMountedRef.current) return null;

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          isTimedOut: false
        }));

        effectiveOptions.onSuccess?.(result);
        logger.debug('Operation completed successfully', { attempt });
        
        return result;
      } catch (error) {
        if (!isMountedRef.current) return null;

        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        if (attempt <= (effectiveOptions.retryAttempts || 0)) {
          logger.info(`Operation failed, retrying... (${attempt}/${effectiveOptions.retryAttempts})`, {
            error: errorObj.message
          });
          
          await new Promise(resolve => 
            setTimeout(resolve, effectiveOptions.retryDelay || 1000)
          );
          
          return executeWithRetry(attempt + 1);
        }

        // Final failure
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorObj,
          isTimedOut: false
        }));

        effectiveOptions.onError?.(errorObj);
        logger.error('Operation failed after retries', errorObj);
        
        return null;
      }
    };

    return executeWithRetry(1);
  }, [options]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isTimedOut: false,
      attemptCount: 0
    });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
    isIdle: !state.isLoading && !state.error && !state.isTimedOut
  };
}

/**
 * Simplified loading hook for basic operations
 */
export function useSimpleLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    withLoading,
    reset,
    setError
  };
}