
import React, { useCallback } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";
import { AlertCircle } from "lucide-react";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { LoadingState } from "@/components/LoadingState";
import { ValidationError } from "@/components/ValidationError";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function UnifiedDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const { 
    data: dashboardData,
    isLoading,
    error,
    refetchData,
    lastUpdated,
    isRefreshing
  } = useDashboardData();

  const handleErrorReset = useCallback(() => {
    refetchData();
    toast({
      title: "Retrying...",
      description: "Attempting to fetch dashboard data again.",
    });
  }, [refetchData, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 space-y-6 p-6">
          <LoadingState message="Loading dashboard data..." showProgress />
        </div>
      </Layout>
    );
  }

  if (error && !dashboardData) {
    return (
      <Layout>
        <div className="flex-1 space-y-6 p-6">
          <ValidationError 
            type="error"
            message={error.message}
            title="Error Loading Dashboard"
          />
          <Button 
            onClick={handleErrorReset}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <ErrorBoundary
          customMessage="Unable to load dashboard header. Please refresh the page."
          onReset={handleErrorReset}
        >
          <DashboardHeader 
            isRefreshing={isRefreshing}
            handleRefreshData={refetchData}
            lastUpdated={lastUpdated}
          />
        </ErrorBoundary>

        {error && dashboardData && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Data Refresh Failed</AlertTitle>
            <AlertDescription>
              {error.message}. Using previously cached data. Click refresh to try again.
            </AlertDescription>
          </Alert>
        )}

        <ErrorBoundary
          customMessage="Unable to load metrics data. You can still view other dashboard sections."
          onReset={handleErrorReset}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MetricsCards />
          </div>
        </ErrorBoundary>

        <ErrorBoundary
          customMessage="Unable to load analytics data. You can still view other dashboard sections."
          onReset={handleErrorReset}
        >
          <DashboardTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            predictions={[]}
            insights={[]}
            isAnalyzing={false}
            error={null}
            comparisons={[]}
            handleRefreshData={refetchData}
            trendData={[]}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
