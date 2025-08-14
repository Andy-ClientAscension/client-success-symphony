import { useEffect, useState, useCallback, useMemo } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  lastUpdate: number;
}

interface UsePerformanceOptions {
  trackMemory?: boolean;
  debounceMs?: number;
  maxSamples?: number;
}

export function usePerformance(
  componentName?: string,
  options: UsePerformanceOptions = {}
) {
  const {
    trackMemory = false,
    debounceMs = 100,
    maxSamples = 10
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    lastUpdate: Date.now()
  });

  const [renderHistory, setRenderHistory] = useState<number[]>([]);

  // Track render start time
  const renderStartRef = React.useRef<number>(0);

  // Debounced metrics update
  const updateMetrics = useCallback(
    debounce(() => {
      const renderTime = performance.now() - renderStartRef.current;
      
      const newMetrics: PerformanceMetrics = {
        renderTime,
        componentCount: metrics.componentCount + 1,
        lastUpdate: Date.now()
      };

      // Add memory tracking if supported and enabled
      if (trackMemory && 'memory' in performance) {
        newMetrics.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      }

      setMetrics(newMetrics);
      
      // Update render history
      setRenderHistory(prev => {
        const newHistory = [...prev, renderTime];
        return newHistory.slice(-maxSamples);
      });

      // Log performance in development
      if (process.env.NODE_ENV === 'development' && componentName) {
        console.log(`[Performance] ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          totalRenders: newMetrics.componentCount,
          avgRenderTime: `${(renderHistory.reduce((a, b) => a + b, 0) / renderHistory.length).toFixed(2)}ms`
        });
      }
    }, debounceMs),
    [componentName, trackMemory, debounceMs, maxSamples, metrics.componentCount, renderHistory]
  );

  // Mark render start
  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  // Mark render end and update metrics
  useEffect(() => {
    updateMetrics();
  });

  // Calculate average render time
  const avgRenderTime = useMemo(() => {
    if (renderHistory.length === 0) return 0;
    return renderHistory.reduce((a, b) => a + b, 0) / renderHistory.length;
  }, [renderHistory]);

  // Performance status
  const performanceStatus = useMemo(() => {
    if (avgRenderTime < 16) return 'excellent'; // 60fps
    if (avgRenderTime < 33) return 'good';      // 30fps
    if (avgRenderTime < 100) return 'fair';     // 10fps
    return 'poor';
  }, [avgRenderTime]);

  // Memory pressure warning
  const memoryPressure = useMemo(() => {
    if (!metrics.memoryUsage) return 'unknown';
    const mb = metrics.memoryUsage / (1024 * 1024);
    if (mb < 50) return 'low';
    if (mb < 100) return 'medium';
    return 'high';
  }, [metrics.memoryUsage]);

  return {
    metrics,
    avgRenderTime,
    renderHistory,
    performanceStatus,
    memoryPressure,
    reset: useCallback(() => {
      setMetrics({
        renderTime: 0,
        componentCount: 0,
        lastUpdate: Date.now()
      });
      setRenderHistory([]);
    }, [])
  };
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// React import for useRef
import React from 'react';