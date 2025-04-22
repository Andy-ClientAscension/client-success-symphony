
import React, { useState, useCallback } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { LoadingState } from "@/components/LoadingState";
import { ValidationError } from "@/components/ValidationError";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function UnifiedDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    data: dashboardData,
    isLoading,
    error,
    refetch: refetchDashboardData,
    dataUpdatedAt,
    isRefetching
  } = useDashboardData();

  const handleErrorReset = useCallback(() => {
    refetchDashboardData();
  }, [refetchDashboardData]);

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
            isRefreshing={isRefetching}
            handleRefreshData={refetchDashboardData}
            lastUpdated={dataUpdatedAt}
          />
        </ErrorBoundary>

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
            handleRefreshData={refetchDashboardData}
            trendData={[]}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
