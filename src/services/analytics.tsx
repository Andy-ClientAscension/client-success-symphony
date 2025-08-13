import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
}

interface PageViewEvent {
  page: string;
  title: string;
  url: string;
  referrer: string;
  timestamp: string;
  sessionId: string;
  userId?: string;
}

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initialize() {
    try {
      // Get user ID from authentication if available
      this.userId = localStorage.getItem('user_id') || undefined;
      
      // Set up periodic flush of events
      setInterval(() => {
        this.flushEvents();
      }, 30000); // Flush every 30 seconds

      // Flush events before page unload
      window.addEventListener('beforeunload', () => {
        this.flushEvents();
      });

      this.isInitialized = true;
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  // Track page views
  trackPageView(page: string, title: string = document.title) {
    const pageView: PageViewEvent = {
      page,
      title,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.queueEvent('page_view', pageView);
  }

  // Track custom events
  track(event: string, properties: Record<string, any> = {}) {
    this.queueEvent(event, properties);
  }

  // Track user interactions
  trackClick(element: string, properties: Record<string, any> = {}) {
    this.track('click', {
      element,
      ...properties
    });
  }

  // Track form submissions
  trackFormSubmit(formName: string, properties: Record<string, any> = {}) {
    this.track('form_submit', {
      form: formName,
      ...properties
    });
  }

  // Track search queries
  trackSearch(query: string, results: number, properties: Record<string, any> = {}) {
    this.track('search', {
      query,
      results,
      ...properties
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string, action: string, properties: Record<string, any> = {}) {
    this.track('feature_usage', {
      feature,
      action,
      ...properties
    });
  }

  // Track errors
  trackError(error: Error, context?: string, properties: Record<string, any> = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      ...properties
    });
  }

  // Track performance metrics
  trackPerformance(metrics: Partial<PerformanceMetrics>) {
    this.track('performance', metrics);
  }

  // Track user timing
  trackTiming(category: string, variable: string, time: number, label?: string) {
    this.track('timing', {
      category,
      variable,
      time,
      label
    });
  }

  private queueEvent(event: string, properties: Record<string, any>) {
    if (!this.isInitialized) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.events.push(analyticsEvent);

    // Flush if queue gets too large
    if (this.events.length > 50) {
      this.flushEvents();
    }
  }

  private async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // In a real application, you would send to your analytics endpoint
      // For now, we'll store in localStorage and log to console
      
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      existingEvents.push(...eventsToSend);
      
      // Keep only the last 1000 events
      localStorage.setItem('analytics_events', JSON.stringify(existingEvents.slice(-1000)));

      if (process.env.NODE_ENV === 'development') {
        console.group('📊 Analytics Events');
        eventsToSend.forEach(event => {
          console.log(`${event.event}:`, event.properties);
        });
        console.groupEnd();
      }

      // Here you would typically send to your analytics service:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventsToSend)
      // });

    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue the events for retry
      this.events.unshift(...eventsToSend);
    }
  }

  // Get analytics data for debugging
  getStoredEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored analytics data
  clearStoredEvents() {
    localStorage.removeItem('analytics_events');
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  const location = useLocation();
  const previousPath = useRef<string>('');

  // Track page views automatically
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (currentPath !== previousPath.current) {
      analytics.trackPageView(currentPath);
      previousPath.current = currentPath;
    }
  }, [location]);

  return {
    track: analytics.track.bind(analytics),
    trackClick: analytics.trackClick.bind(analytics),
    trackFormSubmit: analytics.trackFormSubmit.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackTiming: analytics.trackTiming.bind(analytics)
  };
}

// Performance monitoring hook
export function usePerformanceTracking() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Track Web Vitals when available
    if ('performance' in window) {
      // Track page load time
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        analytics.trackPerformance({ loadTime });
      });

      // Track navigation timing
      if (performance.timing) {
        const timing = performance.timing;
        const metrics = {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadTime: timing.loadEventEnd - timing.navigationStart
        };
        analytics.trackPerformance(metrics);
      }

      // Track paint timing
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            analytics.trackPerformance({ firstContentfulPaint: entry.startTime });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // Performance Observer not supported
      }
    }
  }, []);
}

// Component wrapper for automatic event tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackFeatureUsage } = useAnalytics();

    useEffect(() => {
      trackFeatureUsage('component', 'render', { component: componentName });
    }, [trackFeatureUsage]);

    return <Component {...props} />;
  };
}

// Analytics dashboard component for viewing collected data
export function AnalyticsDashboard() {
  const events = analytics.getStoredEvents();
  const recentEvents = events.slice(-20).reverse();

  const eventCounts = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <button
          onClick={() => analytics.clearStoredEvents()}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Clear Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Event Counts</h4>
          <div className="space-y-1">
            {Object.entries(eventCounts).map(([event, count]) => (
              <div key={event} className="flex justify-between text-sm">
                <span>{event}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Recent Events</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {recentEvents.map((event, index) => (
              <div key={index} className="text-xs bg-muted p-2 rounded">
                <div className="font-medium">{event.event}</div>
                <div className="text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
