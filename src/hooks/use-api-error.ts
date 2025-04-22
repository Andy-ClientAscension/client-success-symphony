
import { useState } from 'react';
import { errorService } from '@/utils/errorService';
import { toast } from '@/hooks/use-toast';

type ApiErrorState = {
  message: string;
  code?: string;
  details?: unknown;
};

export function useApiError() {
  const [error, setError] = useState<ApiErrorState | null>(null);

  const handleError = (err: unknown, fallbackMessage = 'An error occurred') => {
    let errorMessage = fallbackMessage;
    let errorCode: string | undefined;
    let errorDetails: unknown;

    if (err instanceof Error) {
      errorMessage = err.message;
      errorDetails = err;
    } else if (typeof err === 'object' && err !== null) {
      // Handle structured API errors
      const apiError = err as { message?: string; code?: string; details?: unknown };
      errorMessage = apiError.message || fallbackMessage;
      errorCode = apiError.code;
      errorDetails = apiError.details;
    }

    const errorState = {
      message: errorMessage,
      code: errorCode,
      details: errorDetails
    };

    setError(errorState);
    
    // Report to error service
    errorService.captureError(new Error(errorMessage), {
      severity: 'medium',
      context: {
        code: errorCode,
        details: errorDetails
      }
    });

    // Show toast notification
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });

    return errorState;
  };

  const clearError = () => setError(null);

  return {
    error,
    handleError,
    clearError
  };
}
