
import React, { useEffect } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { DashboardKPIHeader } from "@/components/Dashboard/Metrics/DashboardKPIHeader";
import { PerformanceTrends } from "@/components/Dashboard/Metrics/PerformanceTrends";
import { SSCPerformanceOverview } from "@/components/Dashboard/Performance/SSCPerformanceOverview";
import { HealthJourneyTracker } from "@/components/Dashboard/Health/HealthJourneyTracker";
import { ClientList } from "@/components/Dashboard/ClientList";
import { Card } from "@/components/ui/card";
import { SyncStatus } from "@/components/SyncStatus";
import { useSyncedData } from "@/hooks/useSyncedData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { HealthScoreOverview } from "@/components/Dashboard/HealthScore/HealthScoreOverview";
import { HealthScoreSummary } from "@/components/Dashboard/HealthScore/HealthScoreSummary";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useApiError } from "@/hooks/use-api-error";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data, error, isLoading, lastUpdated, isRefreshing } = useSyncedData();
  const { npsData, churnData } = useDashboardData();
  const { handleError, clearError, error: apiError, isNetworkError } = useApiError();
  
  // Handle API errors
  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load dashboard data");
    }
  }, [error, handleError]);

  // Function to retry loading data
  const handleRetryLoad = async () => {
    clearError();
    try {
      window.location.reload();
    } catch (retryError) {
      handleError(retryError, "Failed to reload dashboard data");
    }
  };

  return (
    <Layout>
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <SyncStatus status={{ lastUpdated, isRefreshing }} />
        </div>

        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>
              {isNetworkError ? "Connection Error" : "Data Loading Error"}
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <div>
                {apiError.message}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 w-fit" 
                onClick={handleRetryLoad}
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        ) : (
          <>
            <DashboardKPIHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceTrends 
                npsMonthlyData={npsData?.trend || []}
                churnData={churnData || []}
              />
              <HealthScoreOverview clients={data?.clients || []} />
            </div>

            <HealthScoreSummary clients={data?.clients || []} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SSCPerformanceOverview />
                <Card className="p-6">
                  <ClientList />
                </Card>
              </div>
              <aside className="lg:col-span-1">
                <HealthJourneyTracker />
              </aside>
            </div>
          </>
        )}
      </main>
    </Layout>
  );
}
