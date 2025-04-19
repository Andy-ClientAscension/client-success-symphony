
import React, { useState, useCallback } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ValidationError } from "@/components/ValidationError";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";

export default function UnifiedDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { clients, clientCounts, metrics, error: dashboardError, refetch: refetchDashboardData } = useDashboardData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    refetchDashboardData().finally(() => {
      setIsRefreshing(false);
    });
  }, [refetchDashboardData]);

  const handleErrorReset = useCallback(() => {
    refetchDashboardData();
  }, [refetchDashboardData]);

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <ErrorBoundary
          customMessage="Unable to load dashboard header. Please refresh the page."
          onReset={handleErrorReset}
        >
          <DashboardHeader 
            isRefreshing={isRefreshing}
            handleRefreshData={handleRefreshData}
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
            handleRefreshData={handleRefreshData}
            trendData={[]}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
