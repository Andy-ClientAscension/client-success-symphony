import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useQueryClient } from "@tanstack/react-query";
import { useAIInsights } from '@/hooks/use-ai-insights';
import { useSystemHealth } from '@/hooks/use-system-health';
import { generateClientComparisons } from '@/utils/aiDataAnalyzer';
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ValidationError } from "@/components/ValidationError";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnifiedDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefetching, setIsRefetching] = useState(false);
  const { runSystemHealthCheck } = useSystemHealth();

  const {
    clients,
    clientCounts,
    npsData,
    churnData,
    metrics,
    isLoading,
    error: dashboardError,
    refetch: refetchDashboardData
  } = useDashboardData();

  const [comparisons, setComparisons] = useState(() => 
    clients ? generateClientComparisons(clients) : []
  );
  
  const { 
    insights, 
    predictions, 
    isAnalyzing, 
    analyzeClients,
    cancelAnalysis,
    error: aiError, 
    lastAnalyzed
  } = useAIInsights(clients || []);

  const isRefreshing = isLoading || isRefetching;

  const handleRefreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefetching(true);
    
    if (activeTab === "ai-insights") {
      runSystemHealthCheck();
    }
    
    try {
      await analyzeClients(true);
      if (clients) {
        const newComparisons = generateClientComparisons(clients);
        setComparisons(newComparisons);
      }
      
      await refetchDashboardData();
      
      toast({
        title: "Refreshing data",
        description: "Your dashboard data is being updated.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error refreshing data",
        description: error instanceof Error ? error.message : "An error occurred refreshing the data.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRefetching(false);
    }
  }, [isRefreshing, queryClient, toast, activeTab, analyzeClients, clients, refetchDashboardData, runSystemHealthCheck]);

  const handleErrorReset = useCallback(() => {
    refetchDashboardData();
  }, [refetchDashboardData]);

  if (dashboardError) {
    return (
      <Layout>
        <Card className="m-6 p-6">
          <ValidationError
            type="error"
            message="There was an error loading the dashboard data."
            showIcon
            title="Dashboard Error"
          />
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Error details: {dashboardError instanceof Error ? dashboardError.message : 'Unknown error'}
            </p>
            <Button 
              variant="outline" 
              onClick={handleErrorReset} 
              className="mt-4"
            >
              Retry Loading Dashboard
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }

  const trendsArray = metrics?.trends ? [metrics.trends] : [];

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <DashboardHeader 
          isRefreshing={isRefreshing}
          handleRefreshData={handleRefreshData}
        />
        
        <ErrorBoundary onReset={handleErrorReset}>
          <DashboardTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            predictions={predictions}
            insights={insights}
            isAnalyzing={isAnalyzing}
            error={aiError}
            comparisons={comparisons}
            handleRefreshData={handleRefreshData}
            cancelAnalysis={cancelAnalysis}
            trendData={Array.isArray(metrics?.performanceTrends) ? metrics?.performanceTrends : []}
            lastAnalyzed={lastAnalyzed}
          />
        </ErrorBoundary>
        
        {aiError && !dashboardError && (
          <Card className="p-4 mt-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800 dark:text-orange-300">AI Analysis Error</h3>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  {aiError.message || "There was an error analyzing the data."}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                  Dashboard data is still available, but AI insights may be limited.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
