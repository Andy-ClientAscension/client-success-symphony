import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceDebuggerProps {
  visible?: boolean;
}

interface PerformanceData {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  memoryUsage?: number;
}

export function PerformanceDebugger({ visible = false }: PerformanceDebuggerProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    const collectPerformanceData = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const data: PerformanceData = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };

      // Add memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        data.memoryUsage = memory.usedJSHeapSize / 1048576; // Convert to MB
      }

      setPerformanceData(data);
    };

    if (isVisible) {
      collectPerformanceData();
      const interval = setInterval(collectPerformanceData, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Performance Debug
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        {performanceData && (
          <>
            <div>Load Time: {performanceData.loadTime.toFixed(2)}ms</div>
            <div>DOM Ready: {performanceData.domContentLoaded.toFixed(2)}ms</div>
            <div>First Paint: {performanceData.firstPaint.toFixed(2)}ms</div>
            <div>FCP: {performanceData.firstContentfulPaint.toFixed(2)}ms</div>
            {performanceData.memoryUsage && (
              <div>Memory: {performanceData.memoryUsage.toFixed(1)}MB</div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}