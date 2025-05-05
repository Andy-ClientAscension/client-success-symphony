
import { Metric, ReportHandler, onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';
import { captureException } from '@/utils/sentry/config';
import { toast } from '@/components/ui/use-toast';

export type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

export interface WebVitalMetric extends Metric {
  name: MetricName;
}

/**
 * Default handler that logs web vitals to console in development
 * and sends them to Sentry in production
 */
export function reportWebVitals(metric: WebVitalMetric): void {
  // Always log to console in development
  if (import.meta.env.DEV) {
    console.log(`Web Vital: ${metric.name}`, metric);
    return;
  }
  
  try {
    // Send metrics to Sentry in production
    const tags = {
      metric_name: metric.name,
      metric_value: Math.round(metric.value * 100) / 100,
      metric_rating: metric.rating, // 'good', 'needs-improvement', or 'poor'
    };
    
    // Add web vitals as performance spans to Sentry
    import('@sentry/react').then(Sentry => {
      const transaction = Sentry.startTransaction({
        name: `Web Vital: ${metric.name}`,
        op: 'web-vital',
      });
      
      transaction.setTag('web_vital', metric.name);
      transaction.setTag('value', metric.value.toString());
      transaction.setTag('rating', metric.rating);
      
      transaction.finish();
      
      // For poor metrics, create a breadcrumb
      if (metric.rating === 'poor') {
        Sentry.addBreadcrumb({
          category: 'web-vitals',
          message: `Poor ${metric.name} detected: ${metric.value}`,
          level: 'warning',
        });
      }
    }).catch(err => {
      console.error('Failed to report metric to Sentry:', err);
    });
    
    // Show toast for poor metrics in development
    if (import.meta.env.DEV && metric.rating === 'poor') {
      toast({
        title: `Poor ${metric.name} Performance`,
        description: `Value: ${metric.value.toFixed(2)} (Rating: Poor)`,
        variant: 'destructive',
      });
    }
  } catch (error) {
    console.error('Failed to report web vitals:', error);
    captureException(error, { context: 'web-vitals-reporting' });
  }
}

/**
 * Measures all web vitals and reports them using the provided handler
 */
export function measureWebVitals(onReport: ReportHandler = reportWebVitals): void {
  try {
    // Core Web Vitals
    onCLS(onReport);
    onFID(onReport);
    onLCP(onReport);
    
    // Additional metrics
    onFCP(onReport);
    onINP(onReport);
    onTTFB(onReport);
  } catch (error) {
    console.error('Failed to measure web vitals:', error);
    captureException(error, { context: 'web-vitals-measurement' });
  }
}

/**
 * Get threshold values for web vitals metrics according to Google's recommendations
 */
export function getWebVitalsThresholds(): Record<MetricName, { good: number; poor: number }> {
  return {
    CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
    FID: { good: 100, poor: 300 }, // First Input Delay (ms)
    INP: { good: 200, poor: 500 }, // Interaction to Next Paint (ms)
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
  };
}

/**
 * Determine if a metric value is good, needs improvement, or poor
 */
export function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = getWebVitalsThresholds()[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}
