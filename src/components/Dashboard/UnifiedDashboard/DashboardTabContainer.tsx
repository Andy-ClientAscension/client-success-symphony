
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardOverviewTab } from "./DashboardOverviewTab";
import { CompanyMetricsTab } from "../../CompanyMetrics/CompanyMetricsTab";
import { TeamAnalyticsTab } from "../../TeamAnalytics/TeamAnalyticsTab";
import { AIInsightsTab } from "./AIInsightsTab";
import { BarChart2, PieChart, LineChart, Bot } from "lucide-react";

export function DashboardTabContainer({
  activeTab,
  setActiveTab,
  predictions,
  aiInsights,
  isAnalyzing,
  aiError,
  comparisons,
  handleRefreshData,
  cancelAnalysis,
  trendData,
  lastAnalyzed,
  clients,
  clientMetrics,
}: any) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 flex-wrap gap-2 justify-start overflow-x-auto max-w-full">
        <TabsTrigger value="overview">
          <LineChart className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="company-metrics">
          <PieChart className="h-4 w-4 mr-2" />
          Company Metrics
        </TabsTrigger>
        <TabsTrigger value="team-analytics">
          <BarChart2 className="h-4 w-4 mr-2" />
          Team Analytics
        </TabsTrigger>
        <TabsTrigger value="ai-insights">
          <Bot className="h-4 w-4 mr-2" />
          AI Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <DashboardOverviewTab
          clients={clients}
          clientMetrics={clientMetrics}
        />
      </TabsContent>
      <TabsContent value="company-metrics">
        <CompanyMetricsTab clients={clients} />
      </TabsContent>
      <TabsContent value="team-analytics">
        <TeamAnalyticsTab clients={clients} />
      </TabsContent>
      <TabsContent value="ai-insights">
        <AIInsightsTab
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
      </TabsContent>
    </Tabs>
  );
}
