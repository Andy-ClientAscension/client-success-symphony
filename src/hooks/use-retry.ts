
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, delay: number) => void;
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const calculateBackoffDelay = (attempt: number): number => {
    // Exponential backoff with jitter to prevent thundering herd problem
    const delay = Math.min(
      maxDelay,
      initialDelay * Math.pow(backoffFactor, attempt) * (0.8 + Math.random() * 0.4)
    );
    return Math.floor(delay);
  };

  const execute = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    setIsRetrying(false);
    setRetryCount(0);
    setError(null);
    
    try {
      return await operation(...args);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    }
  }, [operation]);

  const retry = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    if (isRetrying) return null;
    
    setIsRetrying(true);
    setError(null);
    
    let attempt = 0;
    let lastError: Error | null = null;
    
    while (attempt <= maxRetries) {
      try {
        const result = await operation(...args);
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        attempt++;
        setRetryCount(attempt);
        lastError = err instanceof Error ? err : new Error(String(err));
        
        // If we've exhausted our retries, break out of the loop
        if (attempt > maxRetries) {
          break;
        }
        
        // Calculate backoff delay
        const delay = calculateBackoffDelay(attempt - 1);
        
        // Notify about retry
        onRetry?.(attempt, delay);
        
        // Wait for the calculated delay before trying again
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    setIsRetrying(false);
    setError(lastError);
    return null;
  }, [isRetrying, maxRetries, operation, onRetry]);

  return {
    execute,
    retry,
    isRetrying,
    retryCount,
    error,
    reset: useCallback(() => {
      setIsRetrying(false);
      setRetryCount(0);
      setError(null);
    }, [])
  };
}
