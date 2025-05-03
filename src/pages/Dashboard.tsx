
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { DashboardHeader } from "@/components/Dashboard/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart2, Users, TrendingUp } from "lucide-react";
import { RealtimeSyncIndicator } from "@/components/RealtimeSyncIndicator";
import { LoadingState } from "@/components/LoadingState";
import { useSyncedDashboard } from "@/hooks/useSyncedDashboard";
import { HeroMetrics } from "@/components/Dashboard/Metrics/HeroMetrics";
import { StudentsData } from "@/components/StudentsData";
import { SyncMonitorPanel } from "@/components/Dashboard/SyncStatus/SyncMonitorPanel";
import { useAuth } from "@/hooks/use-auth";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";

export default function Dashboard() {
  const {
    isLoading,
    error,
    refreshData,
    isRefreshing,
    lastUpdated
  } = useSyncedDashboard();
  
  const { isAuthenticated } = useAuth();

  // Set focus and announce dashboard loading to screen readers
  useEffect(() => {
    if (isAuthenticated) {
      // Announce dashboard is loading to screen readers
      announceToScreenReader("Dashboard is loading", "polite");
      
      // Set focus to main content when dashboard is loaded
      setTimeout(() => {
        setFocusToElement('dashboard-content', 'h1');
      }, 100);
    }
  }, [isAuthenticated]);

  // If still loading dashboard data
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingState message="Loading dashboard data..." showProgress />
          <div aria-live="polite" className="sr-only">
            Loading dashboard data, please wait
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div id="dashboard-content" tabIndex={-1} className="space-y-6 p-6">
        <div aria-live="polite" className="sr-only">
          Dashboard loaded successfully. Last updated {lastUpdated ? lastUpdated.toLocaleString() : 'recently'}.
        </div>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <DashboardHeader 
            isRefreshing={isRefreshing}
            handleRefreshData={refreshData}
            lastUpdated={lastUpdated || new Date()}
            error={error instanceof Error ? error : null}
          />
          <RealtimeSyncIndicator />
        </div>

        {/* Sync Monitor Panel */}
        <SyncMonitorPanel />

        {/* Key Metrics Section */}
        <HeroMetrics className="mb-6" />

        {/* Quick links section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" aria-label="Quick navigation links">
          <Card className="hover:shadow-md transition-all duration-200">
            <Link to="/analytics" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
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
            <Link to="/clients" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
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
            <Link to="/renewals" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
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
        <StudentsData />
      </div>
    </DashboardLayout>
  );
}
