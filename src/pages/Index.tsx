import { Layout } from "@/components/Layout/Layout";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { DashboardSettingsBar } from "@/components/Dashboard/DashboardSettingsBar";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { useRealtimeData } from "@/utils/dataSyncService";
import { STORAGE_KEYS } from "@/utils/persistence";
import { getAllClients, getClientsCountByStatus } from "@/lib/data";
import { useAIInsights } from "@/hooks/use-ai-insights";
import { DashboardTabContainer } from "@/components/Dashboard/UnifiedDashboard/DashboardTabContainer";
import { KeyboardNavigationGuide } from "@/components/Dashboard/Accessibility/KeyboardNavigationGuide";
import { SkipLink } from "@/components/Dashboard/Accessibility/SkipLink";
import { AccessibilityHelp } from "@/components/Dashboard/Accessibility/AccessibilityHelp";
import { announceToScreenReader } from "@/lib/accessibility";
import { PerformanceAlertSystem } from "@/components/Dashboard/PerformanceAlertSystem";
import { BackgroundTasksPanel } from "@/components/Dashboard/BackgroundTasksPanel";
import { MetricsSummary } from "@/components/Dashboard/MetricsSummary";
import { DashboardErrorAlert } from "@/components/Dashboard/DashboardErrorAlert";
import { DataSyncPanel } from "@/components/Dashboard/DataSyncPanel";
import { useDashboardRefresh } from "@/hooks/useDashboardRefresh";

export default function Index() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();
  const [performanceMode, setPerformanceMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [insights, isInsightsLoading] = useRealtimeData(STORAGE_KEYS.AI_INSIGHTS, []);
  const [comparisons, isComparisonsLoading] = useRealtimeData('clientComparisons', []);
  const [trendData, isTrendDataLoading] = useRealtimeData('trendData', [
    { month: 'Jan', mrr: 2500, churn: 5, growth: 15 },
    { month: 'Feb', mrr: 3000, churn: 4, growth: 20 },
    { month: 'Mar', mrr: 3200, churn: 6, growth: 10 },
    { month: 'Apr', mrr: 4000, churn: 3, growth: 25 },
    { month: 'May', mrr: 4200, churn: 2, growth: 12 },
    { month: 'Jun', mrr: 5000, churn: 4, growth: 18 },
  ]);
  const [clientCounts] = useRealtimeData('clientCounts', getClientsCountByStatus());
  const [syncStats] = useRealtimeData('syncStats', { lastSync: null, totalSyncs: 0 });

  const { 
    insights: aiInsights,
    predictions,
    isAnalyzing,
    error: aiError,
    lastAnalyzed,
    analyzeClients,
    cancelAnalysis,
  } = useAIInsights(clients, {
    autoAnalyze: true,
    refreshInterval: 3600000,
    silentMode: true
  });

  useEffect(() => {
    setClients(getAllClients());
  }, []);

  const isLoading = isInsightsLoading || isComparisonsLoading || isTrendDataLoading || isAnalyzing;

  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      toast({
        title: "Auto-Save Enabled",
        description: "Your dashboard data will be saved automatically between sessions",
      });
    }
  }, [toast]);

  const { isRefreshing, handleRefreshData } = useDashboardRefresh(analyzeClients, announceToScreenReader);

  const clientMetrics = {
    total: clientCounts.active + clientCounts["at-risk"] + clientCounts.new + clientCounts.churned,
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    newClients: clientCounts.new,
    churn: clientCounts.churned || 0,
    success: 85,
    growthRate: 12
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    announceToScreenReader(`${value} tab activated`, 'polite');
  };

  return (
    <Layout>
      <SkipLink targetId="main-content" />
      <AccessibilityHelp />
      
      <div className="w-full min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 transition-colors duration-200">
          <div className="container py-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground" id="page-title">Performance Report</h1>
                <div className="flex items-center gap-2">
                  <KeyboardNavigationGuide />
                  <BackgroundTasksPanel 
                    isAnalyzing={isAnalyzing}
                    aiError={aiError}
                    aiInsights={aiInsights}
                    lastAnalyzed={lastAnalyzed}
                  />
                  <DashboardSettingsBar
                    persistDashboard={persistDashboard}
                    togglePersistDashboard={togglePersistDashboard}
                    performanceMode={performanceMode}
                    setPerformanceMode={setPerformanceMode}
                    focusMode={false}
                    onFocusModeChange={() => {}}
                  />
                </div>
              </div>
              <DashboardHeader
                isRefreshing={isRefreshing}
                handleRefreshData={handleRefreshData}
                lastUpdated={syncStats?.lastSync}
              />
            </div>
          </div>
        </div>

        <main id="main-content" className="container py-6 md:py-8 space-y-8 md:space-y-10" tabIndex={-1}>
          <PerformanceAlertSystem performanceMode={performanceMode} />
          <DashboardErrorAlert error={aiError} />

          <div className="grid gap-8 mb-8 animate-fade-in">
            <MetricsSummary />

            <section
              aria-labelledby="tabs-section-heading"
              className="w-full animate-fade-in transition-all duration-300"
            >
              <h2 id="tabs-section-heading" className="sr-only">Dashboard Detail Sections</h2>
              <DashboardTabContainer 
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                predictions={predictions}
                aiInsights={aiInsights}
                isAnalyzing={isAnalyzing}
                aiError={aiError}
                comparisons={comparisons}
                handleRefreshData={handleRefreshData}
                cancelAnalysis={cancelAnalysis}
                trendData={trendData}
                lastAnalyzed={lastAnalyzed}
                clients={clients}
                clientMetrics={clientMetrics}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
              <DataSyncPanel />
              {/* <main className="lg:col-span-9"></main> */}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
