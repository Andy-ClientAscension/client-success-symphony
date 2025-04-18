
import React, { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, LineChart, PieChart, BarChart2 } from "lucide-react";
import { DashboardOverview } from "./DashboardOverview";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded components
const TeamAnalytics = lazy(() => import("../TeamAnalytics").then(mod => ({ default: mod.TeamAnalytics })));
const ClientAnalytics = lazy(() => import("../ClientAnalytics").then(mod => ({ default: mod.ClientAnalytics })));
const AIInsightsTab = lazy(() => import("./AIInsightsTab").then(mod => ({ default: mod.AIInsightsTab })));

// Loading component for lazy-loaded content
const TabSkeleton = () => (
  <div className="w-full space-y-4">
    <Skeleton className="h-[60px] w-full rounded-md" />
    <Skeleton className="h-[200px] w-full rounded-md" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-[100px] rounded-md" />
      <Skeleton className="h-[100px] rounded-md" />
      <Skeleton className="h-[100px] rounded-md" />
    </div>
  </div>
);

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  predictions: any[];
  insights: any[];
  isAnalyzing: boolean;
  comparisons: any[];
  handleRefreshData: () => void;
  trendData: any[];
}

export function DashboardTabs({
  activeTab,
  setActiveTab,
  predictions,
  insights,
  isAnalyzing,
  comparisons,
  handleRefreshData,
  trendData
}: DashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">
          <LineChart className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="team-analytics">
          <PieChart className="h-4 w-4 mr-2" />
          Team Analytics
        </TabsTrigger>
        <TabsTrigger value="client-analytics">
          <BarChart2 className="h-4 w-4 mr-2" />
          Client Analytics
        </TabsTrigger>
        <TabsTrigger value="ai-insights">
          <Bot className="h-4 w-4 mr-2" />
          AI Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <DashboardOverview />
      </TabsContent>

      <TabsContent value="team-analytics">
        <Suspense fallback={<TabSkeleton />}>
          <TeamAnalytics />
        </Suspense>
      </TabsContent>

      <TabsContent value="client-analytics">
        <Suspense fallback={<TabSkeleton />}>
          <ClientAnalytics />
        </Suspense>
      </TabsContent>

      <TabsContent value="ai-insights">
        <Suspense fallback={<TabSkeleton />}>
          <AIInsightsTab 
            predictions={predictions}
            insights={insights}
            isAnalyzing={isAnalyzing}
            comparisons={comparisons}
            handleRefreshData={handleRefreshData}
            trendData={trendData}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
