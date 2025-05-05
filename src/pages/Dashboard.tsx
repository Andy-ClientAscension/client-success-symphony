
import React, { useEffect, Suspense, lazy, useState } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { LoadingState } from "@/components/LoadingState";
import { ErrorWithRetry } from "@/components/ui/skeletons/ErrorWithRetry";
import { useErrorReporting } from "@/hooks/use-error-reporting";
import { useSmartLoading } from "@/hooks/useSmartLoading";
import { useSyncedDashboard } from "@/hooks/useSyncedDashboard";
import { AccessibilityManager } from "@/components/Dashboard/Accessibility/AccessibilityManager";
import { focusRingClasses } from "@/lib/accessibility";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Use React.lazy for component code-splitting
const DashboardHeader = lazy(() => import("@/components/Dashboard/Header").then(mod => ({ default: mod.DashboardHeader })));
const RealtimeSyncIndicator = lazy(() => import("@/components/RealtimeSyncIndicator"));
const LazyHeroMetrics = lazy(() => import("@/components/Dashboard/DashboardComponents").then(mod => ({ default: mod.LazyHeroMetrics })));
const LazyStudentsData = lazy(() => import("@/components/Dashboard/DashboardComponents").then(mod => ({ default: mod.LazyStudentsData })));
const LazySyncMonitorPanel = lazy(() => import("@/components/Dashboard/DashboardComponents").then(mod => ({ default: mod.LazySyncMonitorPanel })));
const LazyAccessibilityHelp = lazy(() => import("@/components/Dashboard/DashboardComponents").then(mod => ({ default: mod.LazyAccessibilityHelp })));
const QuickLinks = lazy(() => import("@/components/Dashboard/QuickLinks"));

// Fallback component for Suspense
const ComponentLoader = ({ message = "Loading component..." }) => (
  <div className="h-32 flex items-center justify-center">
    <LoadingState message={message} size="sm" />
  </div>
);

export default function Dashboard() {
  const [initializingDone, setInitializingDone] = useState(false);
  const { toast } = useToast();
  
  // Use the synced dashboard hook for better data handling
  const {
    isLoading: dataIsLoading,
    error,
    refreshData,
    isRefreshing,
    lastUpdated
  } = useSyncedDashboard();
  
  // Use smart loading to prevent flashes
  const { isLoading } = useSmartLoading(dataIsLoading, { 
    minLoadingTime: 1000, 
    priority: 1 
  });
  
  const { 
    reportError, 
    isReportingOpen, 
    currentError, 
    contextInfo, 
    closeReporting 
  } = useErrorReporting();
  
  // Set initialization as done after first render
  useEffect(() => {
    // Small timeout to ensure UI has time to stabilize
    const timer = setTimeout(() => {
      setInitializingDone(true);
      console.log("Dashboard initialization complete");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Report persistent errors that happen on dashboard level
  useEffect(() => {
    if (error && !isLoading && !isRefreshing) {
      reportError(error, { 
        context: "dashboard-load", 
        additionalInfo: { lastUpdated }, 
        showReportDialog: false 
      });
    }
  }, [error, isLoading, isRefreshing, reportError, lastUpdated]);

  // Add verbose logging to help debug loading state issues
  useEffect(() => {
    console.log("Dashboard loading state:", {
      dataIsLoading,
      isLoading,
      isRefreshing,
      initializingDone,
      error: error ? 'Error exists' : 'No error',
      lastUpdated: lastUpdated?.toISOString() || 'none'
    });
  }, [dataIsLoading, isLoading, isRefreshing, initializingDone, error, lastUpdated]);

  // If still loading dashboard data
  if (isLoading && !initializingDone) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64" aria-live="polite">
          <LoadingState 
            message="Loading dashboard data..." 
            showProgress 
          />
        </div>
      </DashboardLayout>
    );
  }

  // Show error with retry if we failed to load dashboard
  if (error && !isLoading && !lastUpdated) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <ErrorWithRetry
            error={error}
            onRetry={refreshData}
            isRetrying={isRefreshing}
            title="Failed to Load Dashboard"
          />
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={() => reportError(error, { context: "dashboard-load-failed" })}
              className={`mx-auto ${focusRingClasses}`}
            >
              <Bug className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AccessibilityManager mainContentId="dashboard-content" pageTitle="Dashboard">
        <div id="dashboard-content" tabIndex={-1} className="space-y-6 p-6">
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <Suspense fallback={<ComponentLoader message="Loading header..." />}>
              <DashboardHeader 
                isRefreshing={isRefreshing}
                handleRefreshData={refreshData}
                lastUpdated={lastUpdated || new Date()}
                error={error instanceof Error ? error : null}
              />
            </Suspense>
            <Suspense fallback={<div className="h-6" />}>
              <RealtimeSyncIndicator />
            </Suspense>
          </div>

          {/* Show error message with retry option if there is an error but we still have cached data */}
          {error && lastUpdated && (
            <ErrorWithRetry
              error={error}
              onRetry={refreshData}
              isRetrying={isRefreshing}
              title="Failed to refresh data"
              variant="compact"
            />
          )}

          {/* Sync Monitor Panel */}
          <Suspense fallback={<ComponentLoader message="Loading sync status..." />}>
            <LazySyncMonitorPanel />
          </Suspense>

          {/* Key Metrics Section */}
          <section aria-labelledby="metrics-heading">
            <h2 id="metrics-heading" className="sr-only">Key performance metrics</h2>
            <Suspense fallback={<ComponentLoader message="Loading metrics..." />}>
              <LazyHeroMetrics className="mb-6" />
            </Suspense>
          </section>

          {/* Quick links section */}
          <Suspense fallback={<ComponentLoader message="Loading navigation links..." />}>
            <QuickLinks />
          </Suspense>

          {/* Recent students list */}
          <section aria-labelledby="students-heading">
            <h2 id="students-heading" className="sr-only">Recent students</h2>
            <Suspense fallback={<ComponentLoader message="Loading student data..." />}>
              <LazyStudentsData />
            </Suspense>
          </section>
          
          {/* Accessibility help component */}
          <Suspense fallback={<div className="h-8" />}>
            <LazyAccessibilityHelp />
          </Suspense>
        </div>
      </AccessibilityManager>
    </DashboardLayout>
  );
}
