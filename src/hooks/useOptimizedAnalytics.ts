import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
}

// Optimized analytics hook with debouncing and session management
export function useOptimizedAnalytics() {
  const location = useLocation();
  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout>();
  const lastEventRef = useRef<string>('');
  const eventCountRef = useRef<Record<string, number>>({});

  // Debounced event tracking to prevent spam
  const debouncedTrack = useCallback((event: string, properties: Record<string, any> = {}) => {
    const eventKey = `${event}_${JSON.stringify(properties)}`;
    
    // Prevent duplicate events within 1 second
    if (lastEventRef.current === eventKey) {
      return;
    }
    
    lastEventRef.current = eventKey;
    
    // Track event count to prevent spam
    eventCountRef.current[event] = (eventCountRef.current[event] || 0) + 1;
    
    // Limit events per type to prevent infinite loops
    if (eventCountRef.current[event] > 5) {
      console.warn(`Analytics: Event type '${event}' has been called too many times. Skipping.`);
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        pathname: location.pathname,
        timestamp: Date.now()
      },
      timestamp: new Date().toISOString(),
      sessionId: sessionId.current,
      userId: localStorage.getItem('user_id') || undefined
    };

    eventQueue.current.push(analyticsEvent);
    
    // Clear previous timeout and set new one
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    
    flushTimeoutRef.current = setTimeout(() => {
      flushEvents();
    }, 2000); // Flush after 2 seconds of inactivity
    
  }, [location.pathname]);

  // Flush events to storage/analytics service
  const flushEvents = useCallback(() => {
    if (eventQueue.current.length === 0) return;
    
    // In development, just log the events
    if (process.env.NODE_ENV === 'development') {
      console.info('Analytics Events:', eventQueue.current);
    }
    
    // Store in localStorage for persistence
    try {
      const existing = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const combined = [...existing, ...eventQueue.current];
      localStorage.setItem('analytics_events', JSON.stringify(combined.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.warn('Failed to store analytics events:', error);
    }
    
    eventQueue.current = [];
    
    // Reset event counts periodically
    setTimeout(() => {
      eventCountRef.current = {};
    }, 60000); // Reset counts every minute
  }, []);

  // Track page views (only once per route change)
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedTrack('page_view', {
        page: location.pathname,
        title: document.title,
        url: window.location.href
      });
    }, 100); // Small delay to avoid rapid navigation tracking

    return () => clearTimeout(timer);
  }, [location.pathname, debouncedTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushEvents();
    };
  }, [flushEvents]);

  // Optimized tracking functions
  const trackFeatureUsage = useCallback((feature: string, action: string, properties: Record<string, any> = {}) => {
    debouncedTrack('feature_usage', {
      feature,
      action,
      ...properties
    });
  }, [debouncedTrack]);

  const trackClick = useCallback((element: string, properties: Record<string, any> = {}) => {
    debouncedTrack('click', {
      element,
      ...properties
    });
  }, [debouncedTrack]);

  const trackError = useCallback((error: Error, context: string, properties: Record<string, any> = {}) => {
    debouncedTrack('error', {
      error: error.message,
      stack: error.stack,
      context,
      ...properties
    });
  }, [debouncedTrack]);

  return {
    trackFeatureUsage,
    trackClick,
    trackError,
    track: debouncedTrack,
    flushEvents
  };
}