
/**
 * Utility functions for error handling
 */

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
export const createApiErrorHandler = (toast: any) => (error: unknown, title = 'Error') => {
  const message = formatAPIError(error);
  console.error(message, error);
  
  toast({
    title,
    description: message,
    variant: "destructive",
    duration: 5000,
  });
  
  return message;
};
