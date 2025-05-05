
import React, { useEffect } from 'react';
import { measureWebVitals } from '@/utils/performance/webVitalsReporter';

export function WebVitalsMonitor() {
  useEffect(() => {
    // Only measure web vitals in production or when explicitly enabled
    if (import.meta.env.PROD || localStorage.getItem('enable_web_vitals_monitoring') === 'true') {
      // Optimize web vitals loading by using a slight delay after critical content
      const timeoutId = setTimeout(() => {
        // Use dynamic import for web-vitals to avoid impacting initial load time
        import('web-vitals').then(() => {
          measureWebVitals();
          console.log('Web vitals monitoring started');
        }).catch(err => {
          console.error('Failed to load web-vitals:', err);
        });
      }, 2000); // Delay web vitals measurement to prioritize content loading
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // This component doesn't render anything
  return null;
}
