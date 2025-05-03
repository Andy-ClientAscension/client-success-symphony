
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { DashboardHeader } from "@/components/Dashboard/Header";
import { Button } from "@/components/ui/button";
import { Bug, BarChart2, Users, TrendingUp } from "lucide-react";
import { RealtimeSyncIndicator } from "@/components/RealtimeSyncIndicator";
import { LoadingState } from "@/components/LoadingState";
import { useSyncedDashboard } from "@/hooks/useSyncedDashboard";
import { useAuth } from "@/hooks/use-auth";
import { ErrorReportingModal } from "@/components/ErrorReporting/ErrorReportingModal";
import { useErrorReporting } from "@/hooks/use-error-reporting";
import { ErrorWithRetry } from "@/components/ui/skeletons/ErrorWithRetry";
import { AccessibilityManager } from "@/components/Dashboard/Accessibility/AccessibilityManager";
import { focusRingClasses } from "@/lib/accessibility";
import { 
  LazyHeroMetrics, 
  LazyStudentsData,
  LazySyncMonitorPanel,
  LazyAccessibilityHelp
} from "@/components/Dashboard/DashboardComponents";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const {
    isLoading,
    error,
    refreshData,
    isRefreshing,
    lastUpdated
  } = useSyncedDashboard();
  
  const { isAuthenticated } = useAuth();
  const { 
    reportError, 
    isReportingOpen, 
    currentError, 
    contextInfo, 
    closeReporting 
  } = useErrorReporting();

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

  // If still loading dashboard data
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64" aria-live="polite">
          <LoadingState message="Loading dashboard data..." showProgress />
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
            <DashboardHeader 
              isRefreshing={isRefreshing}
              handleRefreshData={refreshData}
              lastUpdated={lastUpdated || new Date()}
              error={error instanceof Error ? error : null}
            />
            <RealtimeSyncIndicator />
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
          <LazySyncMonitorPanel />

          {/* Key Metrics Section */}
          <section aria-labelledby="metrics-heading">
            <h2 id="metrics-heading" className="sr-only">Key performance metrics</h2>
            <LazyHeroMetrics className="mb-6" />
          </section>

          {/* Quick links section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" aria-label="Quick navigation links">
            <Card className="hover:shadow-md transition-all duration-200">
              <Link 
                to="/analytics" 
                className={`block p-6 ${focusRingClasses}`}
                aria-label="View analytics reports and metrics"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full" aria-hidden="true">
                    <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Analytics</h3>
                    <p className="text-sm text-muted-foreground">View detailed reports and metrics</p>
                  </div>
                </div>
              </Link>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200">
              <Link 
                to="/clients" 
                className={`block p-6 ${focusRingClasses}`}
                aria-label="Manage student profiles"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full" aria-hidden="true">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Students</h3>
                    <p className="text-sm text-muted-foreground">Manage student profiles</p>
                  </div>
                </div>
              </Link>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200">
              <Link 
                to="/renewals" 
                className={`block p-6 ${focusRingClasses}`}
                aria-label="Track and manage renewals"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full" aria-hidden="true">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Renewals</h3>
                    <p className="text-sm text-muted-foreground">Track and manage renewals</p>
                  </div>
                </div>
              </Link>
            </Card>
          </section>

          {/* Recent students list */}
          <section aria-labelledby="students-heading">
            <h2 id="students-heading" className="sr-only">Recent students</h2>
            <LazyStudentsData />
          </section>
          
          {/* Error reporting modal */}
          <ErrorReportingModal
            isOpen={isReportingOpen}
            onClose={closeReporting}
            error={currentError}
            context={contextInfo.context}
            additionalInfo={contextInfo.additionalInfo}
          />
          
          {/* Accessibility help component */}
          <LazyAccessibilityHelp />
        </div>
      </AccessibilityManager>
    </DashboardLayout>
  );
}
