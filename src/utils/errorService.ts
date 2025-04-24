
import { toast } from "@/hooks/use-toast";

// Define environment and DSN configuration strategy
const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';

// Enhanced error detection and handling
function isCorsError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('CORS') || 
           error.message.includes('cross-origin') ||
           error.message.includes('blocked by CORS policy');
  }
  if (typeof error === 'string') {
    return error.includes('CORS') || 
           error.includes('cross-origin') ||
           error.includes('blocked by CORS policy');
  }
  return false;
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Failed to fetch') || 
           error.message.includes('NetworkError') ||
           error.message.includes('Network request failed') ||
           error.message.includes('net::ERR');
  }
  if (typeof error === 'string') {
    return error.includes('Failed to fetch') || 
           error.includes('NetworkError') ||
           error.includes('Network request failed') ||
           error.includes('net::ERR');
  }
  return false;
}

function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('401') || 
           error.message.includes('403') || 
           error.message.includes('unauthorized') || 
           error.message.includes('not authenticated');
  }
  if (typeof error === 'string') {
    return error.includes('401') || 
           error.includes('403') || 
           error.includes('unauthorized') || 
           error.includes('not authenticated');
  }
  
  // Handle structured API errors
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string | number }).code;
    return code === 401 || code === 403 || code === 'auth_error';
  }
  
  return false;
}

function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('validation') || error.message.includes('invalid');
  }
  if (typeof error === 'string') {
    return error.includes('validation') || error.includes('invalid');
  }
  
  // Handle structured API errors
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string | number }).code;
    return code === 422 || code === 'validation_error';
  }
  
  return false;
}

function getNetworkErrorMessage(error: unknown): string {
  if (isCorsError(error)) {
    return "Network request blocked due to CORS policy. Please contact your administrator.";
  }
  
  if (isNetworkError(error)) {
    return "Network connection error. Please check your internet connection and try again.";
  }
  
  return typeof error === 'string' ? error : error instanceof Error ? error.message : "An unexpected error occurred";
}

export type ErrorType = 'auth' | 'network' | 'cors' | 'validation' | 'server' | 'unknown';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorOptions {
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  shouldNotify?: boolean;
  user?: {
    id?: string;
    email?: string;
    [key: string]: any;
  };
}

export interface ErrorState {
  message: string;
  type: ErrorType;
  code?: string | number;
  details?: unknown;
}

// Main error service implementation
export const errorService = {
  // Detect the type of error for consistent handling
  detectErrorType(err: unknown): ErrorType {
    if (!err) return 'unknown';
    
    // Use the error detection methods
    if (isCorsError(err)) {
      return 'cors';
    }
    
    if (isNetworkError(err)) {
      return 'network';
    }
    
    if (isAuthError(err)) {
      return 'auth';
    }
    
    if (isValidationError(err)) {
      return 'validation';
    }
    
    // Check for server errors
    if (err instanceof Error && (err.message.includes('500') || err.message.includes('server error'))) {
      return 'server';
    }
    
    if (typeof err === 'string' && (err.includes('500') || err.includes('server error'))) {
      return 'server';
    }
    
    return 'unknown';
  },

  // Generate a user-friendly error message based on error type
  getUserFriendlyMessage(error: unknown, fallbackMessage = "An unexpected error occurred"): string {
    const errorType = this.detectErrorType(error);
    
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
        if (error instanceof Error) {
          return error.message || fallbackMessage;
        }
        if (typeof error === 'string') {
          return error;
        }
        if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
          return error.message;
        }
        return fallbackMessage;
    }
  },

  // Create a structured error state object
  createErrorState(error: unknown, fallbackMessage = "An unexpected error occurred"): ErrorState {
    const errorType = this.detectErrorType(error);
    const message = this.getUserFriendlyMessage(error, fallbackMessage);
    
    let code: string | number | undefined;
    let details: unknown;
    
    if (error && typeof error === 'object') {
      if ('code' in error) {
        code = (error as { code: string | number }).code;
      }
      
      details = error;
    }
    
    return {
      message,
      type: errorType,
      code,
      details
    };
  },

  captureError(error: Error | string, options: ErrorOptions = {}) {
    const { severity = 'medium', context, shouldNotify = true } = options;
    
    // Get user-friendly error message based on error type
    const errorType = typeof error === 'string' ? this.detectErrorType(error) : this.detectErrorType(error);
    const userFriendlyMessage = typeof error === 'string' ? error : error.message;

    // Always show user feedback when needed
    if (shouldNotify) {
      toast({
        title: errorType === 'cors' ? "CORS Error" : 
               errorType === 'network' ? "Connection Error" : 
               errorType === 'server' ? "Server Error" : "Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    }

    // Only log to console in development
    if (IS_DEV) {
      console.error('Error captured:', {
        error: typeof error === 'string' ? new Error(error) : error,
        severity,
        context,
        userFriendlyMessage,
        errorType
      });
    }
  },

  // Capture non-error events like user actions or system events
  captureMessage(message: string, options: ErrorOptions = {}) {
    if (IS_DEV) {
      console.log('Message captured:', message, options);
    }
  },
  
  // Helper for network errors - ensures consistent handling
  handleNetworkError(error: unknown, options: ErrorOptions = {}) {
    const errorType = this.detectErrorType(error);
    const userFriendlyMessage = this.getUserFriendlyMessage(error, "Network error occurred");
    
    // Only log in development
    if (IS_DEV) {
      console.error('Network error:', error);
    }
    
    const errorObject = error instanceof Error ? error : new Error(userFriendlyMessage);
    
    this.captureError(errorObject, {
      ...options,
      severity: errorType === 'cors' ? 'high' : 'medium',
      context: { 
        errorType,
        isNetwork: errorType === 'network' || errorType === 'cors',
        ...options.context 
      }
    });
    
    return userFriendlyMessage;
  },

  // Simple utility to check if a network error is happening
  isNetworkError(error: unknown): boolean {
    const errorType = this.detectErrorType(error);
    return errorType === 'network' || errorType === 'cors';
  },

  // Check if an error is auth related
  isAuthError(error: unknown): boolean {
    return this.detectErrorType(error) === 'auth';
  },

  // Check if an error is a validation error
  isValidationError(error: unknown): boolean {
    return this.detectErrorType(error) === 'validation';
  },
  
  // Check if an error is a server error
  isServerError(error: unknown): boolean {
    return this.detectErrorType(error) === 'server';
  }
};
