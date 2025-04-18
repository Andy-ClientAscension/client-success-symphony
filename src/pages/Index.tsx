
import { Layout } from "@/components/Layout/Layout";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { DashboardSettingsBar } from "@/components/Dashboard/DashboardSettingsBar";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { PerformanceAlert } from "@/components/Dashboard/PerformanceAlert";
import { useRealtimeData } from "@/utils/dataSyncService";
import { STORAGE_KEYS } from "@/utils/persistence";
import { DataSyncMonitor } from "@/components/Dashboard/DataSyncMonitor";
import { getAllClients, getClientsCountByStatus } from "@/lib/data";
import { UnifiedMetricsGrid, generateClientMetrics } from "@/components/Dashboard/Metrics/UnifiedMetricsGrid";
import { ChurnMetricChart, NPSMetricChart } from "@/components/Dashboard/Charts/UnifiedMetricChart";
import { useAIInsights } from "@/hooks/use-ai-insights";
import { BackgroundProcessingIndicator } from "@/components/Dashboard/BackgroundProcessingIndicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { Separator } from "@/components/ui/separator";

export default function Index() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [focusMode, setFocusMode] = useState(false);
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
  
  const handleViewBackgroundTasks = () => {
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
  };
  
  const clientMetrics = generateClientMetrics({
    total: clientCounts.active + clientCounts["at-risk"] + clientCounts.new + clientCounts.churned,
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    newClients: clientCounts.new,
    churn: clientCounts.churned || 0,
    success: 85,
    growthRate: 12
  });

  return (
    <Layout>
      <div 
        className="w-full p-4 px-6 bg-gray-50 dark:bg-gray-900 space-y-8" 
        role="region" 
        aria-label="Performance Dashboard"
      >
        <div className="flex items-start justify-between flex-wrap mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight" tabIndex={0}>
              Performance Report
            </h1>
            <p 
              className="text-muted-foreground"
              tabIndex={0}
              aria-label="Dashboard description"
            >
              Monitor your team's performance and track key metrics
            </p>
          </div>
          <div 
            className="flex items-center gap-2"
            role="toolbar"
            aria-label="Dashboard controls"
          >
            <BackgroundProcessingIndicator 
              tasks={backgroundTasks}
              onClick={handleViewBackgroundTasks}
            />
            <DashboardSettingsBar
              persistDashboard={persistDashboard}
              togglePersistDashboard={togglePersistDashboard}
              performanceMode={performanceMode}
              setPerformanceMode={setPerformanceMode}
              focusMode={focusMode}
              onFocusModeChange={setFocusMode}
            />
          </div>
        </div>

        <div 
          className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800"
          role="toolbar"
          aria-label="Dashboard actions"
        >
          <DashboardHeader
            isRefreshing={isRefreshing || isLoading}
            handleRefreshData={handleRefreshData}
          />
        </div>

        {aiError && (
          <Alert 
            variant="destructive" 
            className="mb-6"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>AI Analysis Error</AlertTitle>
            <AlertDescription>
              {aiError.message}
              <p className="text-sm mt-1">
                AI insights may be outdated or unavailable. The system will retry automatically.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <section className="space-y-6">
          <MetricsCards />
          
          <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NPSMetricChart />
            <ChurnMetricChart />
          </div>
        </section>

        <div className="space-y-6 mt-6">
          {performanceMode && <PerformanceAlert />}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                predictions={predictions}
                insights={aiInsights}
                isAnalyzing={isAnalyzing}
                error={aiError}
                comparisons={comparisons}
                handleRefreshData={handleRefreshData}
                cancelAnalysis={cancelAnalysis}
                trendData={trendData}
                lastAnalyzed={lastAnalyzed}
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
