
import React, { lazy, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart2, PieChart, LineChart, Bot } from "lucide-react";
import { KeyboardNavigationGuide } from "../Accessibility/KeyboardNavigationGuide";
import { SkipLink } from "../Accessibility/SkipLink";
import { focusRingClasses } from "@/lib/accessibility";
import { reducedMotionConfig } from "@/lib/accessibility";
import { LoadingState } from "@/components/LoadingState";

// Lazy load tab content components
const DashboardOverviewTab = lazy(() => 
  import(/* webpackChunkName: "overview-tab" */ "./DashboardOverviewTab").then(mod => ({ default: mod.DashboardOverviewTab }))
);
const CompanyMetricsTab = lazy(() => 
  import(/* webpackChunkName: "company-metrics-tab" */ "../CompanyMetrics/CompanyMetricsTab").then(mod => ({ default: mod.CompanyMetricsTab }))
);
const TeamAnalyticsTab = lazy(() => 
  import(/* webpackChunkName: "team-analytics-tab" */ "../TeamAnalytics/TeamAnalyticsTab").then(mod => ({ default: mod.TeamAnalyticsTab }))
);
const AIInsightsTab = lazy(() => 
  import(/* webpackChunkName: "ai-insights-tab" */ "./AIInsightsTab").then(mod => ({ default: mod.AIInsightsTab }))
);

// Tab content loaders
const TabContentLoader = () => (
  <div className="w-full py-8">
    <LoadingState message="Loading content..." showProgress />
  </div>
);

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
            <Suspense fallback={<TabContentLoader />}>
              <DashboardOverviewTab clients={clients} clientMetrics={clientMetrics} />
            </Suspense>
          </TabsContent>
          <TabsContent 
            value="company-metrics" 
            tabIndex={0}
            aria-label="Company Metrics Content"
            className={animationClass}
          >
            <Suspense fallback={<TabContentLoader />}>
              <CompanyMetricsTab clients={clients} />
            </Suspense>
          </TabsContent>
          <TabsContent 
            value="team-analytics" 
            tabIndex={0}
            aria-label="Team Analytics Content"
            className={animationClass}
          >
            <Suspense fallback={<TabContentLoader />}>
              <TeamAnalyticsTab clients={clients} />
            </Suspense>
          </TabsContent>
          <TabsContent 
            value="ai-insights" 
            tabIndex={0}
            aria-label="AI Insights Content"
            className={animationClass}
          >
            <Suspense fallback={<TabContentLoader />}>
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
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
