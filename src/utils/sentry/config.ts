
import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';

export async function initializeSentry() {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'SENTRY_DSN')
      .single();
    
    if (error || !data) {
      console.warn('Sentry DSN not found in secrets');
      return;
    }

    const dsn = data.value;

    Sentry.init({
      dsn: dsn,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Don't send events in development
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        return event;
      },
    });

    // Set user information if available
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      });
    }

  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}
