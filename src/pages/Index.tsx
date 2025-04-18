
import { Layout } from "@/components/Layout/Layout";
import { CompanyMetrics } from "@/components/Dashboard/CompanyMetrics";
import { TeamAnalytics } from "@/components/Dashboard/TeamAnalytics";
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
        <div className="flex items-center justify-between flex-wrap mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="text-xl font-bold">Performance Report</div>
          <DashboardSettingsBar
            persistDashboard={persistDashboard}
            togglePersistDashboard={togglePersistDashboard}
            performanceMode={performanceMode}
            setPerformanceMode={setPerformanceMode}
            focusMode={focusMode}
            onFocusModeChange={setFocusMode}
          />
        </div>

        <DashboardHeader
          isRefreshing={isRefreshing}
          handleRefreshData={handleRefreshData}
        />

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

        {performanceMode && <PerformanceAlert />}
      </div>
    </Layout>
  );
}
