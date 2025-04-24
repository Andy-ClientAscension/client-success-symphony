
// Remove sentry imports since we're not using it
import { toast } from "@/hooks/use-toast";

// Define environment and DSN configuration strategy
const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';

// Sentry is disabled by default unless explicitly configured
const SENTRY_ENABLED = false;

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

function getNetworkErrorMessage(error: unknown): string {
  if (isCorsError(error)) {
    return "Network request blocked due to CORS policy. Please contact your administrator.";
  }
  
  if (isNetworkError(error)) {
    return "Network connection error. Please check your internet connection and try again.";
  }
  
  return typeof error === 'string' ? error : error instanceof Error ? error.message : "An unexpected error occurred";
}

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorOptions {
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  shouldNotify?: boolean;
  user?: {
    id?: string;
    email?: string;
    [key: string]: any;
  };
}

export const errorService = {
  setUser(user: { id: string; email: string }) {
    // No-op since Sentry is disabled
  },

  clearUser() {
    // No-op since Sentry is disabled
  },

  captureError(error: Error | string, options: ErrorOptions = {}) {
    const { severity = 'medium', context, shouldNotify = true, user } = options;
    
    // Get user-friendly error message
    const userFriendlyMessage = isCorsError(error) 
      ? getNetworkErrorMessage(error)
      : typeof error === 'string' ? error : error.message;

    // Always show user feedback when needed
    if (shouldNotify) {
      toast({
        title: "An error occurred",
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
        userFriendlyMessage
      });
    }
  },

  // Capture non-error events like user actions or system events
  captureMessage(message: string, options: ErrorOptions = {}) {
    if (IS_DEV) {
      console.log('Message captured:', message, options);
    }
  },
  
  // Helper for network errors
  handleNetworkError(error: unknown, options: ErrorOptions = {}) {
    const userFriendlyMessage = getNetworkErrorMessage(error);
    
    // Only log in development
    if (IS_DEV) {
      console.error('Network error:', error);
    }
    
    const errorObject = error instanceof Error ? error : new Error(userFriendlyMessage);
    
    this.captureError(errorObject, {
      ...options,
      severity: isCorsError(error) ? 'high' : 'medium',
      context: { 
        errorType: isNetworkError(error) ? 'network' : isCorsError(error) ? 'cors' : 'unknown',
        isCors: isCorsError(error),
        isNetwork: isNetworkError(error),
        ...options.context 
      }
    });
    
    return userFriendlyMessage;
  },

  // Simple utility to check if a network error is happening
  isNetworkError(error: unknown): boolean {
    return isNetworkError(error) || isCorsError(error);
  },

  // Generate a user-friendly error message
  getUserFriendlyErrorMessage(error: unknown): string {
    if (isCorsError(error) || isNetworkError(error)) {
      return getNetworkErrorMessage(error);
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return "An unexpected error occurred. Please try again later.";
  }
};
