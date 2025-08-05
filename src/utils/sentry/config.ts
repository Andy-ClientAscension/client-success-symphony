
import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';

// Initialize Sentry with proper configuration
export async function initializeSentry() {
  try {
    // Try to get Sentry DSN from Supabase secrets first
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'SENTRY_DSN')
      .single();
    
    // If we can't get it from Supabase, use a fallback DSN
    const dsn = data?.value || process.env.SENTRY_DSN;
    
    if (!dsn) {
      console.warn('No valid Sentry DSN found. Error tracking is disabled.');
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
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Only send errors in production environment
      beforeSend(event) {
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        return event;
      },
      // Set environment
      environment: process.env.NODE_ENV || 'development',
    });

    console.log('Sentry has been initialized successfully');

    // Set user information if available
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      });
    }

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
