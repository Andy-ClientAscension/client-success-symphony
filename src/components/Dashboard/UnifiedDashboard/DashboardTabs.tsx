import React, { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, LineChart, PieChart, BarChart2 } from "lucide-react";
import { DashboardOverview } from "./DashboardOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy-loaded components
const TeamAnalytics = lazy(() => import("../TeamAnalytics").then(mod => ({ default: mod.TeamAnalytics })));
const ClientAnalytics = lazy(() => import("../ClientAnalytics").then(mod => ({ default: mod.ClientAnalytics })));
const AIInsightsTab = lazy(() => import("./AIInsightsTab").then(mod => ({ default: mod.AIInsightsTab })));

// Loading component for lazy-loaded content
const TabSkeleton = () => (
  <div className="w-full space-y-4" role="status" aria-label="Loading tab content">
    <Skeleton className="h-[60px] w-full rounded-md" />
    <Skeleton className="h-[200px] w-full rounded-md" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-[100px] rounded-md" />
      <Skeleton className="h-[100px] rounded-md" />
      <Skeleton className="h-[100px] rounded-md" />
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  predictions: any[];
  insights: any[];
  isAnalyzing: boolean;
  error?: Error | null;
  comparisons: any[];
  handleRefreshData: () => void;
  cancelAnalysis?: () => void;
  trendData: any[];
  lastAnalyzed?: Date | null;
}

export function DashboardTabs({
  activeTab,
  setActiveTab,
  predictions,
  insights,
  isAnalyzing,
  error,
  comparisons,
  handleRefreshData,
  cancelAnalysis,
  trendData,
  lastAnalyzed
}: DashboardTabsProps) {
  const { isMobile } = useIsMobile();
  
  const getIconLabel = (iconName: string) => {
    return isMobile ? iconName : `${iconName} Icon`;
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="w-full"
      aria-label="Dashboard Sections"
    >
      <TabsList 
        className="mb-4 flex-wrap gap-2 justify-start overflow-x-auto max-w-full"
        aria-label="Dashboard navigation"
      >
        <TabsTrigger 
          value="overview" 
          aria-label="Overview Section"
          role="tab"
        >
          <LineChart 
            className="h-4 w-4 mr-2" 
            aria-hidden="true"
            role="img"
            aria-label={getIconLabel("Line Chart")} 
          />
          <span className="sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="team-analytics" 
          aria-label="Team Analytics Section"
          role="tab"
        >
          <PieChart 
            className="h-4 w-4 mr-2" 
            aria-hidden="true"
            role="img"
            aria-label={getIconLabel("Pie Chart")}
          />
          <span className="sm:inline">Team Analytics</span>
        </TabsTrigger>
        <TabsTrigger 
          value="client-analytics" 
          aria-label="Client Analytics Section"
          role="tab"
        >
          <BarChart2 
            className="h-4 w-4 mr-2" 
            aria-hidden="true"
            role="img"
            aria-label={getIconLabel("Bar Chart")}
          />
          <span className="sm:inline">Client Analytics</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ai-insights" 
          aria-label="AI Insights Section"
          role="tab"
        >
          <Bot 
            className="h-4 w-4 mr-2" 
            aria-hidden="true"
            role="img"
            aria-label={getIconLabel("Bot")}
          />
          <span className="sm:inline">AI Insights</span>
        </TabsTrigger>
      </TabsList>

      <div 
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        role="tabpanel"
      >
        <TabsContent 
          value="overview" 
          role="tabpanel" 
          tabIndex={0}
          aria-label="Overview Content"
        >
          <DashboardOverview />
        </TabsContent>

        <TabsContent 
          value="team-analytics" 
          role="tabpanel" 
          tabIndex={0}
          aria-label="Team Analytics Content"
        >
          <Suspense fallback={<TabSkeleton />}>
            <TeamAnalytics />
          </Suspense>
        </TabsContent>

        <TabsContent 
          value="client-analytics" 
          role="tabpanel" 
          tabIndex={0}
          aria-label="Client Analytics Content"
        >
          <Suspense fallback={<TabSkeleton />}>
            <ClientAnalytics />
          </Suspense>
        </TabsContent>

        <TabsContent 
          value="ai-insights" 
          role="tabpanel" 
          tabIndex={0}
          aria-label="AI Insights Content"
        >
          <Suspense fallback={<TabSkeleton />}>
            <AIInsightsTab 
              predictions={predictions}
              insights={insights}
              isAnalyzing={isAnalyzing}
              error={error}
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
  );
}
