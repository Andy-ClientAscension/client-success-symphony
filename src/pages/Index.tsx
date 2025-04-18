
import { Layout } from "@/components/Layout/Layout";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { DashboardSettingsBar } from "@/components/Dashboard/DashboardSettingsBar";
import { DashboardTabs } from "@/components/Dashboard/UnifiedDashboard/DashboardTabs";
import { DashboardHeader } from "@/components/Dashboard/UnifiedDashboard/DashboardHeader";
import { PerformanceAlert } from "@/components/Dashboard/PerformanceAlert";

export default function Index() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [focusMode, setFocusMode] = useState(false);
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();
  const [performanceMode, setPerformanceMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [trendData, setTrendData] = useState([]);

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
            isRefreshing={isRefreshing}
            handleRefreshData={handleRefreshData}
          />
        </div>

        {/* Vertical F-pattern stem: Main content */}
        <div className="space-y-6">
          {performanceMode && <PerformanceAlert />}
          
          <DashboardTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            predictions={predictions}
            insights={insights}
            isAnalyzing={isRefreshing}
            comparisons={comparisons}
            handleRefreshData={handleRefreshData}
            trendData={trendData}
          />
        </div>
      </div>
    </Layout>
  );
}
