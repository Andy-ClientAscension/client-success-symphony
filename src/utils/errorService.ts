
import * as Sentry from '@sentry/react';
import { toast } from '@/hooks/use-toast';

// Initialize Sentry
Sentry.init({
  dsn: "YOUR_SENTRY_DSN", // This should be configured through Supabase secrets in production
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  // Only enable in production
  enabled: import.meta.env.PROD,
  environment: import.meta.env.MODE,
});

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
    Sentry.setUser(user);
  },

  clearUser() {
    Sentry.setUser(null);
  },

  captureError(error: Error | string, options: ErrorOptions = {}) {
    const { severity = 'medium', context, shouldNotify = true, user } = options;
    
    if (user) {
      Sentry.setUser(user);
    }

    if (context) {
      Sentry.setContext("error_context", context);
    }

    const errorObject = typeof error === 'string' ? new Error(error) : error;
    
    Sentry.captureException(errorObject, {
      level: severity === 'critical' ? 'fatal' : 
             severity === 'high' ? 'error' :
             severity === 'medium' ? 'warning' : 'info'
    });

    if (shouldNotify) {
      toast({
        title: "An error occurred",
        description: errorObject.message,
        variant: "destructive",
      });
    }

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
    Sentry.captureMessage(message, {
      level: options.severity === 'critical' ? 'fatal' :
             options.severity === 'high' ? 'error' :
             options.severity === 'medium' ? 'warning' : 'info'
    });
  }
};
