import React from 'react';
import { usePerformance } from '@/hooks/use-performance';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu, MemoryStick, Clock } from 'lucide-react';

interface PerformanceMonitorProps {
  componentName?: string;
  showMemory?: boolean;
  compact?: boolean;
}

export function PerformanceMonitor({
  componentName = 'Component',
  showMemory = false,
  compact = false
}: PerformanceMonitorProps) {
  const {
    metrics,
    avgRenderTime,
    performanceStatus,
    memoryPressure,
    reset
  } = usePerformance(componentName, { trackMemory: showMemory });

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'fair': return 'warning';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  const getMemoryColor = (pressure: string) => {
    switch (pressure) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  if (compact) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <EnhancedCard variant="glass" className="p-3 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            <span>{avgRenderTime.toFixed(1)}ms</span>
            <Badge 
              variant={getStatusColor(performanceStatus) as any}
              className="text-xs px-1"
            >
              {performanceStatus}
            </Badge>
          </div>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <EnhancedCard variant="glass" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Performance Monitor
          </h3>
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Avg Render Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono">{avgRenderTime.toFixed(2)}ms</span>
              <Badge 
                variant={getStatusColor(performanceStatus) as any}
                className="text-xs"
              >
                {performanceStatus}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>Renders</span>
            </div>
            <span className="font-mono">{metrics.componentCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Last Render</span>
            </div>
            <span className="font-mono">{metrics.renderTime.toFixed(2)}ms</span>
          </div>

          {showMemory && metrics.memoryUsage && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-3 w-3" />
                <span>Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">
                  {(metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB
                </span>
                <Badge 
                  variant={getMemoryColor(memoryPressure) as any}
                  className="text-xs"
                >
                  {memoryPressure}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          Component: {componentName}
        </div>
      </EnhancedCard>
    </div>
  );
}