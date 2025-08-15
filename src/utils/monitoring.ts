/**
 * Production monitoring and analytics setup
 * Centralizes all monitoring configuration
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { getEnvironmentConfig } from './environment';

interface MonitoringConfig {
  enableWebVitals: boolean;
  enableUserTracking: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
}

/**
 * Initialize monitoring based on environment
 */
export function initializeMonitoring(): MonitoringConfig {
  const config = getEnvironmentConfig();
  
  const monitoringConfig: MonitoringConfig = {
    enableWebVitals: config.environment === 'production',
    enableUserTracking: config.enableAnalytics,
    enablePerformanceTracking: config.environment === 'production',
    enableErrorTracking: config.enableErrorTracking,
  };
  
  if (monitoringConfig.enableWebVitals) {
    initializeWebVitals();
  }
  
  if (monitoringConfig.enablePerformanceTracking) {
    initializePerformanceTracking();
  }
  
  return monitoringConfig;
}

/**
 * Initialize Web Vitals monitoring
 */
function initializeWebVitals() {
  const sendToAnalytics = (metric: Metric) => {
    // Send to your analytics service
    console.log('Web Vital:', metric);
    
    // Example: Send to Google Analytics 4 (if available)
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', metric.name, {
        custom_map: { metric_id: 'custom_metric' },
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
    
    // Example: Send to custom analytics endpoint
    if (window.fetch) {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(console.error);
    }
  };
  
  // Register all Web Vitals
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

/**
 * Initialize performance tracking
 */
function initializePerformanceTracking() {
  // Track navigation timing
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0];
          const metrics = {
            dns: nav.domainLookupEnd - nav.domainLookupStart,
            tcp: nav.connectEnd - nav.connectStart,
            ssl: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
            ttfb: nav.responseStart - nav.requestStart,
            download: nav.responseEnd - nav.responseStart,
            domInteractive: nav.domInteractive - nav.fetchStart,
            domComplete: nav.domComplete - nav.fetchStart,
            loadComplete: nav.loadEventEnd - nav.fetchStart,
          };
          
          console.log('Performance metrics:', metrics);
          
          // Send to analytics
          if (window.fetch) {
            fetch('/api/analytics/performance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(metrics),
            }).catch(console.error);
          }
        }
      }, 0);
    });
  }
  
  // Track resource loading times
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming;
        if (resource.duration > 1000) { // Only track slow resources
          console.log('Slow resource:', {
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize,
          });
        }
      }
    }
  });
  
  observer.observe({ entryTypes: ['resource'] });
}

/**
 * Track custom business metrics
 */
export function trackBusinessMetric(name: string, value: number, labels?: Record<string, string>) {
  console.log('Business metric:', { name, value, labels });
  
  // Send to analytics service
  if (window.fetch) {
    fetch('/api/analytics/business-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value, labels, timestamp: Date.now() }),
    }).catch(console.error);
  }
}

/**
 * Track user interactions
 */
export function trackUserInteraction(action: string, category: string, label?: string) {
  console.log('User interaction:', { action, category, label });
  
  // Send to analytics
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
}

/**
 * Health check endpoint for monitoring
 */
export function createHealthCheck() {
  return {
    timestamp: new Date().toISOString(),
    environment: getEnvironmentConfig().environment,
    userAgent: navigator.userAgent,
    url: window.location.href,
    performance: {
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      } : null,
      timing: performance.timing,
    },
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : null,
  };
}