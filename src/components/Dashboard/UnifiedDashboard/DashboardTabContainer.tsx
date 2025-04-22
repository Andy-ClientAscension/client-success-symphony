
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardOverviewTab } from "./DashboardOverviewTab";
import { CompanyMetricsTab } from "../CompanyMetrics/CompanyMetricsTab";
import { TeamAnalyticsTab } from "../TeamAnalytics/TeamAnalyticsTab";
import { AIInsightsTab } from "./AIInsightsTab";
import { BarChart2, PieChart, LineChart, Bot } from "lucide-react";
import { KeyboardNavigationGuide } from "../Accessibility/KeyboardNavigationGuide";
import { SkipLink } from "../Accessibility/SkipLink";
import { focusRingClasses } from "@/lib/accessibility";
import { reducedMotionConfig } from "@/lib/accessibility";

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
  // Apply reduced motion settings
  const animationsEnabled = reducedMotionConfig.enableAnimation();
  const animationClass = animationsEnabled ? "transition-all duration-300" : "transition-none";
  
  return (
    <div>
      <SkipLink targetId="dashboard-content" label="Skip to dashboard content" />
      
      <div className="flex justify-end mb-2">
        <KeyboardNavigationGuide />
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
        aria-label="Dashboard Sections"
      >
        <TabsList 
          className="mb-4 flex-wrap gap-2 justify-start overflow-x-auto max-w-full border-b border-border/40 bg-background shadow-none"
          aria-label="Dashboard navigation"
        >
          <TabsTrigger
            value="overview"
            className={`p-3 font-medium text-foreground rounded-t 
              data-[state=active]:bg-accent/40 data-[state=active]:text-primary 
              data-[state=active]:shadow-md hover:bg-accent/20 ${focusRingClasses} transition-colors`}
            aria-label="Overview Tab"
          >
            <LineChart className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="company-metrics"
            className={`p-3 font-medium text-foreground rounded-t 
              data-[state=active]:bg-accent/40 data-[state=active]:text-primary 
              data-[state=active]:shadow-md hover:bg-accent/20 ${focusRingClasses} transition-colors`}
            aria-label="Company Metrics Tab"
          >
            <PieChart className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Company Metrics</span>
          </TabsTrigger>
          <TabsTrigger
            value="team-analytics"
            className={`p-3 font-medium text-foreground rounded-t 
              data-[state=active]:bg-accent/40 data-[state=active]:text-primary 
              data-[state=active]:shadow-md hover:bg-accent/20 ${focusRingClasses} transition-colors`}
            aria-label="Team Analytics Tab"
          >
            <BarChart2 className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Team Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai-insights"
            className={`p-3 font-medium text-foreground rounded-t 
              data-[state=active]:bg-accent/40 data-[state=active]:text-primary 
              data-[state=active]:shadow-md hover:bg-accent/20 ${focusRingClasses} transition-colors`}
            aria-label="AI Insights Tab"
          >
            <Bot className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>AI Insights</span>
          </TabsTrigger>
        </TabsList>

        <div id="dashboard-content" className={`${animationClass}`} role="region" aria-label="Dashboard Content">
          <TabsContent 
            value="overview"
            tabIndex={0}
            aria-label="Overview Content"
            className={animationClass}
          >
            <DashboardOverviewTab clients={clients} clientMetrics={clientMetrics} />
          </TabsContent>
          <TabsContent 
            value="company-metrics" 
            tabIndex={0}
            aria-label="Company Metrics Content"
            className={animationClass}
          >
            <CompanyMetricsTab clients={clients} />
          </TabsContent>
          <TabsContent 
            value="team-analytics" 
            tabIndex={0}
            aria-label="Team Analytics Content"
            className={animationClass}
          >
            <TeamAnalyticsTab clients={clients} />
          </TabsContent>
          <TabsContent 
            value="ai-insights" 
            tabIndex={0}
            aria-label="AI Insights Content"
            className={animationClass}
          >
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
        </div>
      </Tabs>
    </div>
  );
}
