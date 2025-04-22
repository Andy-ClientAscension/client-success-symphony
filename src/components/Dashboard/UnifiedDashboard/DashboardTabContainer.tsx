
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardOverviewTab } from "./DashboardOverviewTab";
import { CompanyMetricsTab } from "../CompanyMetrics/CompanyMetricsTab";
import { TeamAnalyticsTab } from "../TeamAnalytics/TeamAnalyticsTab";
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
  // Improve accessibility, color, and keyboard focus for tab triggers
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 flex-wrap gap-2 justify-start overflow-x-auto max-w-full border-b border-border/40 bg-background shadow-none">
        <TabsTrigger
          value="overview"
          className="p-3 font-medium text-foreground rounded-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors data-[state=active]:bg-accent/40 data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-accent/20"
        >
          <LineChart className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="company-metrics"
          className="p-3 font-medium text-foreground rounded-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors data-[state=active]:bg-accent/40 data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-accent/20"
        >
          <PieChart className="h-4 w-4 mr-2" />
          Company Metrics
        </TabsTrigger>
        <TabsTrigger
          value="team-analytics"
          className="p-3 font-medium text-foreground rounded-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors data-[state=active]:bg-accent/40 data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-accent/20"
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Team Analytics
        </TabsTrigger>
        <TabsTrigger
          value="ai-insights"
          className="p-3 font-medium text-foreground rounded-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors data-[state=active]:bg-accent/40 data-[state=active]:text-primary data-[state=active]:shadow-md hover:bg-accent/20"
        >
          <Bot className="h-4 w-4 mr-2" />
          AI Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <DashboardOverviewTab clients={clients} clientMetrics={clientMetrics} />
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
