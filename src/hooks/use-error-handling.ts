
import { useState } from 'react';
import { ErrorResponse, fetchWithErrorHandling, handleFormSubmission } from '@/utils/errorHandling';

export function useErrorHandling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  
  async function handleAsyncOperation<T>(
    operation: () => Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (data: T) => void;
    } = {}
  ): Promise<T | null> {
    setIsLoading(true);
    setError(null);
    
    try {
      const [data, error] = await fetchWithErrorHandling(operation, {
        customErrorMessage: options.errorMessage
      });
      
      if (error) {
        setError(error);
        return null;
      }
      
      if (options.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }
      
      options.onSuccess?.(data as T);
      return data;
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleFormOperation<T>(
    submitFn: () => Promise<T>,
    options: {
      successMessage?: string;
      onSuccess?: (data: T) => void;
      onError?: (error: ErrorResponse) => void;
    } = {}
  ): Promise<void> {
    setIsLoading(true);
    setError(null);
    
    await handleFormSubmission(submitFn, {
      ...options,
      onError: (error) => {
        setError(error);
        options.onError?.(error);
      }
    });
    
    setIsLoading(false);
  }
  
  return {
    isLoading,
    error,
    clearError: () => setError(null),
    handleAsyncOperation,
    handleFormOperation
  };
}

