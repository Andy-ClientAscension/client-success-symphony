
import React, { ComponentType } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MetricErrorFallback } from "../Shared/MetricErrorFallback";

export function withMetricErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  metricType: string = "metric"
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        customMessage={`Unable to display ${metricType} data.`}
        fallback={
          <MetricErrorFallback
            error={new Error(`Failed to render ${metricType}`)}
            resetErrorBoundary={() => window.location.reload()}
          />
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
