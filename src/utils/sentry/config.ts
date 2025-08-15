
import * as Sentry from '@sentry/react';
import { getEnvironmentConfig } from '@/utils/environment';

// Initialize Sentry with proper configuration
export async function initializeSentry() {
  try {
    const config = getEnvironmentConfig();
    
    // Only initialize Sentry in production or if explicitly enabled
    if (config.environment !== 'production' && !config.enableErrorTracking) {
      console.log('Sentry disabled for development environment');
      return;
    }
    
    const dsn = config.sentryDsn;
    
    if (!dsn) {
      console.warn('No Sentry DSN configured. Error tracking is disabled.');
      return;
    }

    // Check if DSN is a placeholder
    if (dsn === 'YOUR_SENTRY_DSN' || dsn.includes('placeholder')) {
      console.warn('Sentry is using a placeholder DSN. Please set a valid DSN.');
      return;
    }

    Sentry.init({
      dsn: dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Only send errors in production environment
      beforeSend(event) {
        if (config.environment !== 'production') {
          return null;
        }
        return event;
      },
      // Set environment
      environment: config.environment,
    });

    console.log('Sentry has been initialized successfully');

    // Note: User context will be set when auth state changes
    // This avoids dependency on supabase client here

    // Set up Sentry routing instrumentation if using React Router
    if (window.location.pathname) {
      Sentry.configureScope((scope) => {
        scope.setTag("route", window.location.pathname);
      });
    }

  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

// Function to update user context when auth state changes
export function updateSentryUser(user: any) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    // Clear user data on logout
    Sentry.setUser(null);
  }
}

// Utility function to manually capture errors
export function captureException(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured for Sentry:', error, context);
  }
  
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}
