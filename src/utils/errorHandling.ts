
/**
 * Utility functions for error handling
 */
import { toast } from "@/hooks/use-toast";

// Function to format API errors into user-friendly messages
export const formatAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Type for error responses
export interface ErrorResponse {
  message: string;
  field?: string;
  code?: string;
  details?: unknown;
}

// Helper to safely execute async API calls with consistent error handling
export async function safeApiCall<T>(
  apiFunction: () => Promise<T>,
  errorMessage = 'API request failed'
): Promise<[T | null, Error | null]> {
  try {
    const result = await apiFunction();
    return [result, null];
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return [null, error instanceof Error ? error : new Error(formatAPIError(error))];
  }
}

// Create a reusable error handler for API calls
export const createApiErrorHandler = (customToast: typeof toast) => (error: unknown, title = 'Error') => {
  const message = formatAPIError(error);
  console.error(message, error);
  
  customToast({
    title,
    description: message,
    variant: "destructive",
    duration: 5000,
  });
  
  return message;
};

// Enhanced API error handler with type safety
export async function fetchWithErrorHandling<T>(
  apiFunction: () => Promise<T>,
  options: {
    toastOnError?: boolean;
    throwOnError?: boolean;
    customErrorMessage?: string;
  } = {}
): Promise<[T | null, ErrorResponse | null]> {
  const { toastOnError = true, throwOnError = false, customErrorMessage } = options;
  
  try {
    const result = await apiFunction();
    return [result, null];
  } catch (error) {
    const formattedError = formatAPIError(error);
    const errorResponse: ErrorResponse = {
      message: customErrorMessage || formattedError,
      details: error
    };
    
    if (toastOnError) {
      toast({
        title: "Error",
        description: errorResponse.message,
        variant: "destructive",
      });
    }
    
    console.error('API Error:', errorResponse);
    
    if (throwOnError) {
      throw error;
    }
    
    return [null, errorResponse];
  }
}

// Form error parser
export function parseFormError(error: unknown): Record<string, string> {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
      // Not JSON, return generic error
      return { form: error.message };
    }
  }
  return { form: 'An unexpected error occurred' };
}

// Form submission wrapper
export async function handleFormSubmission<T>(
  submitFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: ErrorResponse) => void;
    successMessage?: string;
  } = {}
): Promise<void> {
  const { onSuccess, onError, successMessage } = options;
  
  try {
    const result = await submitFn();
    
    if (successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      });
    }
    
    onSuccess?.(result);
  } catch (error) {
    const errorResponse: ErrorResponse = {
      message: error instanceof Error ? error.message : 'Form submission failed',
      details: error
    };
    
    toast({
      title: "Error",
      description: errorResponse.message,
      variant: "destructive",
    });
    
    onError?.(errorResponse);
  }
}
