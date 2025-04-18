
import { Layout } from "@/components/Layout/Layout";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { DashboardSettingsBar } from "@/components/Dashboard/DashboardSettingsBar";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { PerformanceAlert } from "@/components/Dashboard/PerformanceAlert";
import { useRealtimeData } from "@/utils/dataSyncService";
import { STORAGE_KEYS } from "@/utils/persistence";
import { DataSyncMonitor } from "@/components/Dashboard/DataSyncMonitor";
import { getClientsCountByStatus } from "@/lib/data";
import { UnifiedMetricsGrid, generateClientMetrics } from "@/components/Dashboard/Metrics/UnifiedMetricsGrid";
import { ChurnMetricChart, NPSMetricChart } from "@/components/Dashboard/Charts/UnifiedMetricChart";

export default function Index() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [focusMode, setFocusMode] = useState(false);
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();
  const [performanceMode, setPerformanceMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use realtime data hooks for dashboard data
  const [insights, isInsightsLoading] = useRealtimeData(STORAGE_KEYS.AI_INSIGHTS, []);
  const [predictions, isPredictionsLoading] = useRealtimeData('aiPredictions', []);
  const [comparisons, isComparisonsLoading] = useRealtimeData('clientComparisons', []);
  const [trendData, isTrendDataLoading] = useRealtimeData('trendData', [
    { month: 'Jan', mrr: 2500, churn: 5, growth: 15 },
    { month: 'Feb', mrr: 3000, churn: 4, growth: 20 },
    { month: 'Mar', mrr: 3200, churn: 6, growth: 10 },
    { month: 'Apr', mrr: 4000, churn: 3, growth: 25 },
    { month: 'May', mrr: 4200, churn: 2, growth: 12 },
    { month: 'Jun', mrr: 5000, churn: 4, growth: 18 },
  ]);
  
  // Get client status counts for metrics
  const [clientCounts] = useRealtimeData('clientCounts', getClientsCountByStatus());

  // Compute overall loading state
  const isLoading = isInsightsLoading || isPredictionsLoading || isComparisonsLoading || isTrendDataLoading;

  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      toast({
        title: "Auto-Save Enabled",
        description: "Your dashboard data will be saved automatically between sessions",
      });
    }
  }, [toast]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Simulated refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Generate metrics data from client counts
  const clientMetrics = generateClientMetrics({
    total: clientCounts.active + clientCounts["at-risk"] + clientCounts.new + clientCounts.churned,
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    newClients: clientCounts.new,
    churn: clientCounts.churned || 0,
    success: 85, // Example value
    growthRate: 12 // Example value
  });

  return (
    <Layout>
      <div className="w-full p-4 px-6 bg-gray-50 dark:bg-gray-900" role="region" aria-label="Performance Dashboard">
        {/* First F-pattern stroke: Main header with strong visual hierarchy */}
        <div className="flex items-start justify-between flex-wrap mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Performance Report</h1>
            <p className="text-muted-foreground">
              Monitor your team's performance and track key metrics
            </p>
          </div>
          <DashboardSettingsBar
            persistDashboard={persistDashboard}
            togglePersistDashboard={togglePersistDashboard}
            performanceMode={performanceMode}
            setPerformanceMode={setPerformanceMode}
            focusMode={focusMode}
            onFocusModeChange={setFocusMode}
          />
        </div>

        {/* Second F-pattern stroke: Action bar and filters */}
        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <DashboardHeader
            isRefreshing={isRefreshing || isLoading}
            handleRefreshData={handleRefreshData}
          />
        </div>

        {/* Unified Metrics Section */}
        <div className="mb-6">
          <UnifiedMetricsGrid
            metrics={clientMetrics}
            columns={7}
            className="mb-6"
          />
        </div>

        {/* Consolidated Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <NPSMetricChart />
          <ChurnMetricChart />
        </div>

        {/* Vertical F-pattern stem: Main content */}
        <div className="space-y-6">
          {performanceMode && <PerformanceAlert />}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                predictions={predictions}
                insights={insights}
                isAnalyzing={isRefreshing || isLoading}
                comparisons={comparisons}
                handleRefreshData={handleRefreshData}
                trendData={trendData}
              />
            </div>
            <div className="lg:col-span-1">
              <DataSyncMonitor />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
