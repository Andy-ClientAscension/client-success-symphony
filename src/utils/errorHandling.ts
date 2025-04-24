
/**
 * Utility functions for error handling
 */
import { toast } from "@/hooks/use-toast";
import { errorService, ErrorState } from "@/utils/errorService";

// Re-export the ErrorState type from errorService
export type { ErrorState as ErrorResponse };

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
    return [null, error instanceof Error ? error : new Error(errorService.getUserFriendlyMessage(error))];
  }
}

// Create a reusable error handler for API calls
export const createApiErrorHandler = (customToast: typeof toast) => (error: unknown, title = 'Error') => {
  const errorState = errorService.createErrorState(error);
  console.error(errorState.message, error);
  
  customToast({
    title,
    description: errorState.message,
    variant: "destructive",
    duration: 5000,
  });
  
  return errorState.message;
};

// Enhanced API error handler with type safety
export async function fetchWithErrorHandling<T>(
  apiFunction: () => Promise<T>,
  options: {
    toastOnError?: boolean;
    throwOnError?: boolean;
    customErrorMessage?: string;
  } = {}
): Promise<[T | null, ErrorState | null]> {
  const { toastOnError = true, throwOnError = false, customErrorMessage } = options;
  
  try {
    const result = await apiFunction();
    return [result, null];
  } catch (error) {
    const errorState = errorService.createErrorState(error, customErrorMessage);
    
    if (toastOnError) {
      toast({
        title: "Error",
        description: errorState.message,
        variant: "destructive",
      });
    }
    
    console.error('API Error:', errorState);
    
    if (throwOnError) {
      throw error;
    }
    
    return [null, errorState];
  }
}

// Form submission wrapper
export async function handleFormSubmission<T>(
  submitFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: ErrorState) => void;
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
    const errorState = errorService.createErrorState(error, 'Form submission failed');
    
    toast({
      title: "Error",
      description: errorState.message,
      variant: "destructive",
    });
    
    onError?.(errorState);
  }
}

// New debug-focused utility for startup errors
export function logStartupPhase(phase: string, context?: any) {
  console.log(`[Startup] ${phase}`, context || '');
}

// Enhanced error logger with more context
export function logDetailedError(error: unknown, context?: string) {
  console.group('Detailed Error Log:');
  console.error(`Context: ${context || 'Unknown'}`);
  
  if (error instanceof Error) {
    console.error(`Name: ${error.name}`);
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    // Handle nested errors
    if ('cause' in error && error.cause instanceof Error) {
      console.error('Caused by:', error.cause);
    }
  } else {
    console.error('Unknown Error Type:', error);
  }
  
  console.groupEnd();
  
  return error instanceof Error ? error.message : String(error);
}
