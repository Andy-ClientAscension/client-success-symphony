import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

export function WebVitalsMonitor() {
  useEffect(() => {
    const handleMetric = (metric: WebVitalMetric) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta
        });
      }
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Analytics tracking would go here
        // Example: gtag('event', metric.name, { value: metric.value });
      }
    };

    // Collect all Core Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  return null; // This component doesn't render anything
}