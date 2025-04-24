
import * as Sentry from '@sentry/react';
import { toast } from '@/hooks/use-toast';

// Only initialize Sentry if a valid DSN is provided
const SENTRY_DSN = ""; // Set this to your actual Sentry DSN if needed

// Initialize Sentry conditionally
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    // Only capture errors, not warnings
    tracesSampleRate: 1.0,
    // Only enable in production
    enabled: import.meta.env.PROD && !!SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
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

function getNetworkErrorMessage(error: unknown): string {
  if (isCorsError(error)) {
    return "Network request blocked due to CORS policy. This may be a temporary issue or require server configuration.";
  }
  
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed')) {
      return "Network connection error. Please check your internet connection and try again.";
    }
  }
  
  return typeof error === 'string' ? error : error instanceof Error ? error.message : "An unexpected error occurred";
}

export const errorService = {
  setUser(user: { id: string; email: string }) {
    if (SENTRY_DSN) {
      Sentry.setUser(user);
    }
  },

  clearUser() {
    if (SENTRY_DSN) {
      Sentry.setUser(null);
    }
  },

  captureError(error: Error | string, options: ErrorOptions = {}) {
    const { severity = 'medium', context, shouldNotify = true, user } = options;
    
    if (SENTRY_DSN && user) {
      Sentry.setUser(user);
    }

    if (SENTRY_DSN && context) {
      Sentry.setContext("error_context", context);
    }

    const errorObject = typeof error === 'string' ? new Error(error) : error;
    
    // Special handling for CORS errors
    if (isCorsError(errorObject)) {
      console.error('CORS Error detected:', errorObject);
      const corsErrorContext = {
        type: 'cors_error',
        url: window.location.href,
        origin: window.location.origin,
        ...context
      };
      
      if (SENTRY_DSN) {
        Sentry.setContext("cors_error_details", corsErrorContext);
      }
    }
    
    // Only send to Sentry if it's configured
    if (SENTRY_DSN) {
      Sentry.captureException(errorObject, {
        level: severity === 'critical' ? 'fatal' : 
               severity === 'high' ? 'error' :
               severity === 'medium' ? 'warning' : 'info'
      });
    }

    // Get user-friendly error message
    const userFriendlyMessage = isCorsError(errorObject) 
      ? getNetworkErrorMessage(errorObject)
      : errorObject.message;

    // Always show user feedback when needed
    if (shouldNotify) {
      toast({
        title: "An error occurred",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error captured:', {
        error: errorObject,
        severity,
        context,
        userFriendlyMessage
      });
    }
  },

  // Capture non-error events like user actions or system events
  captureMessage(message: string, options: ErrorOptions = {}) {
    if (SENTRY_DSN) {
      Sentry.captureMessage(message, {
        level: options.severity === 'critical' ? 'fatal' :
               options.severity === 'high' ? 'error' :
               options.severity === 'medium' ? 'warning' : 'info'
      });
    }
  },
  
  // Helper for network errors
  handleNetworkError(error: unknown, options: ErrorOptions = {}) {
    console.error('Network error:', error);
    
    const userFriendlyMessage = getNetworkErrorMessage(error);
    const errorObject = error instanceof Error ? error : new Error(userFriendlyMessage);
    
    this.captureError(errorObject, {
      ...options,
      severity: 'medium',
      context: { 
        errorType: 'network', 
        isCors: isCorsError(error),
        ...options.context 
      }
    });
    
    return userFriendlyMessage;
  }
};
