
import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useQueryClient } from "@tanstack/react-query";
import { useAIInsights } from '@/hooks/use-ai-insights';
import { useSystemHealth } from '@/hooks/use-system-health';
import { getAllClients } from '@/lib/data';
import { generateClientComparisons } from '@/utils/aiDataAnalyzer';
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";

export default function UnifiedDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefetching, setIsRefetching] = useState(false);
  const { runSystemHealthCheck } = useSystemHealth();
  const [clients] = useState(() => getAllClients());
  const [comparisons, setComparisons] = useState(() => generateClientComparisons(clients));
  
  const [trendData] = useState([
    { month: 'Jan', mrr: 2500, churn: 5, growth: 15 },
    { month: 'Feb', mrr: 3000, churn: 4, growth: 20 },
    { month: 'Mar', mrr: 3200, churn: 6, growth: 10 },
    { month: 'Apr', mrr: 4000, churn: 3, growth: 25 },
    { month: 'May', mrr: 4200, churn: 2, growth: 12 },
    { month: 'Jun', mrr: 5000, churn: 4, growth: 18 },
  ]);

  const isRefreshing = queryClient.isFetching({queryKey: ['ai-insights']}) > 0 || 
                       queryClient.isFetching({queryKey: ['nps-data']}) > 0 || 
                       isRefetching;

  const { 
    insights, 
    predictions, 
    isAnalyzing, 
    analyzeClients
  } = useAIInsights(clients);

  const handleRefreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefetching(true);
    
    if (activeTab === "ai-insights") {
      runSystemHealthCheck();
    }
    
    try {
      await analyzeClients(true);
      const newComparisons = generateClientComparisons(clients);
      setComparisons(newComparisons);
      
      await queryClient.invalidateQueries({
        queryKey: ['nps-data', 'ai-insights'],
        refetchType: 'active',
      });
      
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
    queryClient.invalidateQueries({ queryKey: ['nps-data', 'ai-insights'] });
  }, [queryClient]);

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
            comparisons={comparisons}
            handleRefreshData={handleRefreshData}
            trendData={trendData}
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
