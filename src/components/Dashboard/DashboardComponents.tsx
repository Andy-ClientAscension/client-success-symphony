
import React, { lazy, Suspense } from "react";
import { LoadingState } from "@/components/LoadingState";
import { ErrorWithRetry } from "@/components/ui/skeletons/ErrorWithRetry";

// Lazy load dashboard components with chunk names
export const HeroMetrics = lazy(() => 
  import(/* webpackChunkName: "hero-metrics" */ "@/components/Dashboard/Metrics/HeroMetrics")
    .then(mod => ({ default: mod.HeroMetrics }))
);

// For StudentsData, we need to modify the import since it's not a default export
export const StudentsData = lazy(() => 
  import(/* webpackChunkName: "students-data" */ "@/components/StudentsData")
    .then(mod => ({ default: mod.StudentsData }))
);

export const SyncMonitorPanel = lazy(() => 
  import(/* webpackChunkName: "sync-monitor" */ "@/components/Dashboard/SyncStatus/SyncMonitorPanel")
    .then(mod => ({ default: mod.SyncMonitorPanel }))
);

export const AccessibilityHelp = lazy(() => 
  import(/* webpackChunkName: "accessibility-help" */ "@/components/Dashboard/Accessibility/AccessibilityHelp")
    .then(mod => ({ default: mod.AccessibilityHelp }))
);

// Wrapper components with Suspense
export const LazyHeroMetrics = ({ className }: { className?: string }) => (
  <Suspense fallback={<LoadingState message="Loading metrics..." />}>
    <HeroMetrics className={className} />
  </Suspense>
);

export const LazyStudentsData = () => (
  <Suspense fallback={<LoadingState message="Loading student data..." />}>
    <StudentsData />
  </Suspense>
);

export const LazySyncMonitorPanel = () => (
  <Suspense fallback={<LoadingState message="Loading sync status..." />}>
    <SyncMonitorPanel />
  </Suspense>
);

export const LazyAccessibilityHelp = () => (
  <Suspense fallback={<div className="h-8 w-full" />}>
    <AccessibilityHelp />
  </Suspense>
);

// Error boundary component wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorMessage: string
) {
  return function WithErrorBoundary(props: P) {
    try {
      return <Component {...props} />;
    } catch (error) {
      return (
        <ErrorWithRetry 
          error={error instanceof Error ? error : new Error(errorMessage)} 
          onRetry={() => window.location.reload()} 
          title="Component Error"
        />
      );
    }
  };
}
