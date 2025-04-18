
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
    error: dashboardError
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
    error, // Changed from aiError to error to match the property name in the hook
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
      
      await queryClient.invalidateQueries();
      
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
  }, [isRefreshing, queryClient, toast, activeTab, analyzeClients, clients, runSystemHealthCheck]);

  const handleErrorReset = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  if (dashboardError) {
    return (
      <Layout>
        <Card className="m-6 p-6">
          <ValidationError
            type="error"
            message="There was an error loading the dashboard data. Please try again."
            showIcon
            title="Dashboard Error"
          />
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Error details: {dashboardError instanceof Error ? dashboardError.message : 'Unknown error'}
            </p>
          </div>
        </Card>
      </Layout>
    );
  }

  // Convert metrics.trends object to an array format expected by DashboardTabs
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
            error={error} // Changed from aiError to error
            comparisons={comparisons}
            handleRefreshData={handleRefreshData}
            cancelAnalysis={cancelAnalysis}
            trendData={metrics?.performanceTrends || []}
            lastAnalyzed={lastAnalyzed}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
