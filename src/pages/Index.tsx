
import { Layout } from "@/components/Layout/Layout";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { DashboardSettingsBar } from "@/components/Dashboard/DashboardSettingsBar";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { PerformanceAlert } from "@/components/Dashboard/PerformanceAlert";
import { useRealtimeData } from "@/utils/dataSyncService";
import { STORAGE_KEYS } from "@/utils/persistence";
import { DataSyncMonitor } from "@/components/Dashboard/DataSyncMonitor";
import { getAllClients, getClientsCountByStatus } from "@/lib/data";
import { ChurnMetricChart, NPSMetricChart } from "@/components/Dashboard/Charts/UnifiedMetricChart";
import { useAIInsights } from "@/hooks/use-ai-insights";
import { BackgroundProcessingIndicator, BackgroundTaskStatus } from "@/components/Dashboard/BackgroundProcessingIndicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MetricErrorFallback } from "@/components/Dashboard/Shared/MetricErrorFallback";
import { TableErrorFallback } from "@/components/Dashboard/Shared/TableErrorFallback";
import { DashboardTabContainer } from "@/components/Dashboard/UnifiedDashboard/DashboardTabContainer";

export default function Index() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();
  const [performanceMode, setPerformanceMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const { 
    insights: aiInsights,
    predictions,
    isAnalyzing,
    error: aiError,
    lastAnalyzed,
    analyzeClients,
    cancelAnalysis,
    status
  } = useAIInsights(clients, {
    autoAnalyze: true,
    refreshInterval: 3600000,
    silentMode: true
  });

  useEffect(() => {
    setClients(getAllClients());
  }, []);

  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTaskStatus[]>([
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      status: 'idle'
    },
    {
      id: 'data-sync',
      name: 'Data Synchronization',
      status: 'idle'
    }
  ]);

  useEffect(() => {
    setBackgroundTasks(prev => 
      prev.map(task => 
        task.id === 'ai-analysis' 
          ? { 
              ...task, 
              status: isAnalyzing 
                ? 'running' 
                : aiError 
                  ? 'error' 
                  : aiInsights.length > 0 
                    ? 'success'
                    : 'idle',
              lastRun: isAnalyzing ? undefined : lastAnalyzed || undefined,
              message: aiError ? aiError.message : undefined
            }
          : task
      )
    );
  }, [isAnalyzing, aiError, aiInsights, lastAnalyzed]);

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

  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    analyzeClients(true).finally(() => {
      setIsRefreshing(false);
    });
  }, [analyzeClients]);

  const clientMetrics = {
    total: clientCounts.active + clientCounts["at-risk"] + clientCounts.new + clientCounts.churned,
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    newClients: clientCounts.new,
    churn: clientCounts.churned || 0,
    success: 85,
    growthRate: 12
  };

  const [syncStats] = useRealtimeData('syncStats', { lastSync: null, totalSyncs: 0 });

  return (
    <Layout>
      <div className="w-full min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 transition-colors duration-200">
          <div className="container py-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Performance Report</h1>
                <div className="flex items-center gap-2">
                  <BackgroundProcessingIndicator 
                    tasks={backgroundTasks}
                    onClick={() => {
                      toast({
                        title: "Background Tasks Status",
                        description: isAnalyzing 
                          ? "AI analysis is currently running in the background" 
                          : aiError 
                            ? `Last analysis encountered an error: ${aiError.message}` 
                            : lastAnalyzed 
                              ? `Last analyzed at ${lastAnalyzed.toLocaleString()}` 
                              : "No recent analysis data",
                      });
                    }}
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

        <div className="container py-6 md:py-8 space-y-8 md:space-y-10">
          {aiError && (
            <Alert 
              variant="destructive"
              className="bg-destructive/5 border border-destructive/30 mb-8 animate-fade-in"
              role="alert"
              tabIndex={0}
            >
              <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
              <AlertTitle className="font-bold text-destructive-foreground">AI Analysis Error</AlertTitle>
              <AlertDescription className="text-destructive-foreground">{aiError.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 mb-8 animate-fade-in">
            <div className="grid gap-8 md:gap-10 mb-8 animate-fade-in">
              <div className="p-4 md:p-6 rounded-lg border border-border/30 bg-card shadow-sm">
                <MetricsCards />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 space-y-0 mb-8">
                <ErrorBoundary
                  fallback={<TableErrorFallback 
                    error={new Error("Failed to load NPS chart")} 
                    resetErrorBoundary={() => {}} 
                  />}
                >
                  <div className="bg-background rounded-lg border border-border/30 p-4 focus-visible:outline-none hover:shadow transition-shadow duration-150">
                    <NPSMetricChart />
                  </div>
                </ErrorBoundary>
                <ErrorBoundary
                  fallback={<TableErrorFallback 
                    error={new Error("Failed to load Churn chart")} 
                    resetErrorBoundary={() => {}} 
                  />}
                >
                  <div className="bg-background rounded-lg border border-border/30 p-4 focus-visible:outline-none hover:shadow transition-shadow duration-150">
                    <ChurnMetricChart />
                  </div>
                </ErrorBoundary>
              </div>
            </div>

            <section
              aria-label="Tabs section"
              className="w-full animate-fade-in transition-all duration-300"
              tabIndex={0}
            >
              <DashboardTabContainer 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
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
              <aside className="lg:col-span-3 mb-8 animate-fade-in" tabIndex={0} aria-label="Data Sync Monitor Sidebar">
                <div className="bg-card border border-border/30 p-4 rounded-lg focus-visible:ring-2 focus-visible:ring-primary transition-shadow duration-150">
                  <DataSyncMonitor />
                </div>
              </aside>
              {/* <main className="lg:col-span-9"></main> */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

