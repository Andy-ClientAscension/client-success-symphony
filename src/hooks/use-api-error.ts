
import { useState, useCallback } from 'react';
import { errorService, ErrorState } from '@/utils/errorService';
import { toast } from '@/hooks/use-toast';

export function useApiError() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((err: unknown, fallbackMessage = 'An error occurred') => {
    // Use the unified error service to create a consistent error state
    const errorState = errorService.createErrorState(err, fallbackMessage);
    
    // Special handling for network failures
    if (err && typeof err === 'object' && 'message' in err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') || 
          errorMessage.includes('net::ERR_FAILED')) {
        // Override the error type for generic network failures
        errorState.type = 'network';
        errorState.message = 'Network connection error. Please check your internet connection and try again.';
      }
    }
    
    setError(errorState);
    
    // Use the error service to notify the user, but don't show toast - we'll handle that ourselves
    errorService.captureError(new Error(errorState.message), {
      severity: errorState.type === 'server' ? 'high' : 
                errorState.type === 'cors' || errorState.type === 'network' ? 'medium' : 'low',
      context: {
        code: errorState.code,
        details: errorState.details,
        errorType: errorState.type
      },
      shouldNotify: false // We'll show our own toast
    });

    // Show toast notification for user feedback
    toast({
      title: errorState.type === 'cors' ? "CORS Error" :
             errorState.type === 'network' ? "Connection Error" : 
             errorState.type === 'server' ? "Server Error" :
             errorState.type === 'auth' ? "Authentication Error" : 
             errorState.type === 'validation' ? "Validation Error" : "Error",
      description: errorState.message,
      variant: "destructive",
    });

    return errorState;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    error,
    handleError,
    clearError,
    isNetworkError: error?.type === 'network' || error?.type === 'cors',
    isAuthError: error?.type === 'auth',
    isServerError: error?.type === 'server',
    isValidationError: error?.type === 'validation'
  };
}
