
import { useState } from 'react';
import { errorService } from '@/utils/errorService';
import { toast } from '@/hooks/use-toast';

type ApiErrorState = {
  message: string;
  code?: string;
  details?: unknown;
  type?: 'auth' | 'network' | 'cors' | 'validation' | 'server' | 'unknown';
};

function detectErrorType(err: unknown): ApiErrorState['type'] {
  if (!err) return 'unknown';
  
  const errorStr = err instanceof Error ? err.message : String(err);
  
  // Check for CORS errors first as they're the most critical
  if (errorStr.includes('CORS') || errorStr.includes('cross-origin') || errorStr.includes('blocked by CORS policy')) {
    return 'cors';
  }
  
  if (errorStr.includes('network') || 
      errorStr.includes('Failed to fetch') || 
      errorStr.includes('NetworkError') ||
      errorStr.includes('net::ERR')) {
    return 'network';
  }
  
  if (errorStr.includes('401') || errorStr.includes('403') || errorStr.includes('unauthorized') || errorStr.includes('not authenticated')) {
    return 'auth';
  }
  
  if (errorStr.includes('validation') || errorStr.includes('invalid')) {
    return 'validation';
  }
  
  if (errorStr.includes('500') || errorStr.includes('server error')) {
    return 'server';
  }
  
  return 'unknown';
}

function getErrorMessageFromType(error: unknown, errorType: ApiErrorState['type'], fallbackMessage: string): string {
  switch (errorType) {
    case 'cors':
      return "Network request was blocked by CORS policy. Please contact the administrator.";
    case 'network':
      return "Network connection error. Please check your internet connection and try again.";
    case 'auth':
      return "Authentication error. Please log in again to continue.";
    case 'validation':
      return error instanceof Error ? error.message : "The provided data is invalid. Please check your input and try again.";
    case 'server':
      return "Server error. Our team has been notified and is working on a fix.";
    default:
      return error instanceof Error ? error.message : fallbackMessage;
  }
}

export function useApiError() {
  const [error, setError] = useState<ApiErrorState | null>(null);

  const handleError = (err: unknown, fallbackMessage = 'An error occurred') => {
    let errorMessage: string;
    let errorCode: string | undefined;
    let errorDetails: unknown;
    
    // Detect error type
    const errorType = detectErrorType(err);
    
    // Get user-friendly message based on error type
    errorMessage = getErrorMessageFromType(err, errorType, fallbackMessage);

    if (err instanceof Error) {
      errorDetails = err;
    } else if (typeof err === 'object' && err !== null) {
      // Handle structured API errors
      const apiError = err as { message?: string; code?: string; details?: unknown };
      if (apiError.message) errorMessage = apiError.message;
      errorCode = apiError.code;
      errorDetails = apiError.details;
    }

    const errorState = {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      type: errorType
    };

    setError(errorState);
    
    // Report to error service but don't show toast - we'll handle that ourselves
    errorService.captureError(new Error(errorMessage), {
      severity: errorType === 'server' ? 'high' : 
                errorType === 'cors' || errorType === 'network' ? 'medium' : 'low',
      context: {
        code: errorCode,
        details: errorDetails,
        errorType
      },
      shouldNotify: false // We'll show our own toast
    });

    // Show toast notification for user feedback
    toast({
      title: errorType === 'cors' || errorType === 'network' ? 
             "Connection Error" : 
             errorType === 'server' ? "Server Error" : "Error",
      description: errorMessage,
      variant: "destructive",
    });

    return errorState;
  };

  const clearError = () => setError(null);

  return {
    error,
    handleError,
    clearError,
    isNetworkError: error?.type === 'network' || error?.type === 'cors',
    isAuthError: error?.type === 'auth',
    isServerError: error?.type === 'server'
  };
}
