
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getWebVitalsThresholds, getRating } from '@/utils/performance/webVitalsReporter';
import type { MetricName, WebVitalMetric } from '@/utils/performance/webVitalsReporter';

interface PerformanceDebuggerProps {
  visible?: boolean;
}

export function PerformanceDebugger({ visible = false }: PerformanceDebuggerProps) {
  const [metrics, setMetrics] = useState<Record<string, WebVitalMetric | undefined>>({});
  
  useEffect(() => {
    if (!visible || import.meta.env.PROD) return;
    
    const loadWebVitals = async () => {
      try {
        // Dynamic import the web-vitals library
        const webVitals = await import('web-vitals');
        
        const updateMetric = (metric: WebVitalMetric) => {
          setMetrics(prev => ({
            ...prev,
            [metric.name]: metric
          }));
        };
        
        // Measure all vitals
        webVitals.onCLS(updateMetric);
        webVitals.onFCP(updateMetric);
        webVitals.onFID(updateMetric);
        webVitals.onINP(updateMetric);
        webVitals.onLCP(updateMetric);
        webVitals.onTTFB(updateMetric);
      } catch (error) {
        console.error('Failed to load web-vitals:', error);
      }
    };
    
    loadWebVitals();
  }, [visible]);
  
  if (!visible || import.meta.env.PROD) return null;
  
  const getBadgeColor = (rating?: 'good' | 'needs-improvement' | 'poor') => {
    if (rating === 'good') return 'bg-green-500';
    if (rating === 'needs-improvement') return 'bg-yellow-500';
    if (rating === 'poor') return 'bg-red-500';
    return 'bg-gray-500';
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-3 shadow-lg max-w-xs w-full bg-background/90 backdrop-blur-sm">
        <div className="text-xs font-medium mb-2">Web Vitals</div>
        <div className="space-y-1">
          {Object.entries(metrics).map(([name, metric]) => (
            <div key={name} className="flex justify-between items-center">
              <span>{name}</span>
              <Badge 
                className={`${getBadgeColor(metric?.rating)} text-white`}
                variant="outline"
              >
                {metric ? Math.round(metric.value * 100) / 100 : 'N/A'}
              </Badge>
            </div>
          ))}
          {Object.keys(metrics).length === 0 && (
            <div className="text-xs text-muted-foreground">Collecting metrics...</div>
          )}
        </div>
      </Card>
    </div>
  );
}
