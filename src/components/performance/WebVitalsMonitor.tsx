
import { useEffect, useRef } from 'react';
import { measureWebVitals, reportWebVitals } from '@/utils/performance/webVitalsReporter';
import { logStartupPhase } from '@/utils/errorHandling';

interface WebVitalsMonitorProps {
  enabled?: boolean;
}

/**
 * A component that monitors web vitals metrics when mounted
 * This should be added near the root of the application
 */
export function WebVitalsMonitor({ enabled = true }: WebVitalsMonitorProps) {
  const isMonitoring = useRef(false);
  
  useEffect(() => {
    if (!enabled || isMonitoring.current) return;
    
    try {
      logStartupPhase("Web Vitals monitoring started");
      isMonitoring.current = true;
      measureWebVitals(reportWebVitals);
    } catch (error) {
      console.error("Failed to initialize Web Vitals monitoring:", error);
    }
    
    // We don't cleanup because web-vitals registers one-time observers
  }, [enabled]);
  
  // This component doesn't render anything
  return null;
}
