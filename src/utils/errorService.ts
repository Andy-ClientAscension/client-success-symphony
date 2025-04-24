
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
    
    // Only send to Sentry if it's configured
    if (SENTRY_DSN) {
      Sentry.captureException(errorObject, {
        level: severity === 'critical' ? 'fatal' : 
               severity === 'high' ? 'error' :
               severity === 'medium' ? 'warning' : 'info'
      });
    }

    // Always show user feedback when needed
    if (shouldNotify) {
      toast({
        title: "An error occurred",
        description: errorObject.message,
        variant: "destructive",
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error captured:', {
        error: errorObject,
        severity,
        context
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
  }
};
