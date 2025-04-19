
import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MetricErrorFallback } from "@/components/Dashboard/Shared/MetricErrorFallback";

export function withMetricErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  metricName: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        fallback={
          <MetricErrorFallback 
            error={new Error(`Failed to load ${metricName}`)} 
            resetErrorBoundary={() => window.location.reload()} 
          />
        }
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
