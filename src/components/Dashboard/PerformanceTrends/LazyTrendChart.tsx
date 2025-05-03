
import React, { lazy, Suspense, useState } from "react";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { ErrorWithRetry } from "@/components/ui/skeletons/ErrorWithRetry";
import { announceToScreenReader } from "@/lib/accessibility";

// Lazy load the TrendChart component
const TrendChart = lazy(() => {
  // Add resource hint when we start to load the component
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = "/src/components/Dashboard/PerformanceTrends/TrendChart";
  link.as = "script";
  document.head.appendChild(link);
  
  return import("./TrendChart").then(mod => {
    // Remove resource hint when loaded
    document.head.removeChild(link);
    return { default: mod.TrendChart };
  });
});

// Props interface matching the original TrendChart component
interface LazyTrendChartProps {
  title: string;
  data: any[];
  dataKeys: {
    name: string;
    color: string;
  }[];
  xAxisKey: string;
  onRetry?: () => void;
  error?: Error | null;
  isRetrying?: boolean;
}

export function LazyTrendChart(props: LazyTrendChartProps) {
  const { title, data, error, onRetry, isRetrying } = props;
  const [hasError, setHasError] = useState<Error | null>(null);
  
  // Handle internal errors during loading
  const handleError = (error: Error) => {
    setHasError(error);
    announceToScreenReader(`Error loading ${title} chart: ${error.message}`, 'assertive');
  };
  
  // Handle retry for internal errors
  const handleRetry = () => {
    setHasError(null);
    // Also call parent retry if provided
    if (onRetry) {
      onRetry();
      announceToScreenReader(`Retrying to load ${title} chart`, 'polite');
    }
  };
  
  // Show error passed from parent
  if (error) {
    return (
      <ErrorWithRetry 
        error={error}
        onRetry={onRetry || (() => {})}
        isRetrying={isRetrying}
        title={`Error Loading ${title}`}
        variant="compact"
      />
    );
  }
  
  // Show internal error if any
  if (hasError) {
    return (
      <ErrorWithRetry 
        error={hasError}
        onRetry={handleRetry}
        title={`Error Rendering ${title}`}
        variant="compact"
      />
    );
  }
  
  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-64 border rounded-lg bg-muted/10"
        role="region" 
        aria-label={`${title} - No data available`}
      >
        <div className="text-center">
          <p className="text-muted-foreground">No data available for {title}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="ml-2 text-sm text-primary underline mt-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Refresh data for this chart"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div role="region" aria-label={`${title} chart`} tabIndex={0}>
      <Suspense fallback={<ChartSkeleton height={300} showLegend={true} />}>
        <ErrorBoundary onError={handleError} fallback={
          <ErrorWithRetry 
            error={hasError || new Error("Failed to render chart")}
            onRetry={handleRetry}
            title={`Error Rendering ${title}`}
            variant="compact"
          />
        }>
          <TrendChart {...props} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

// Simple ErrorBoundary component for the chart
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError: (error: Error) => void;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}
