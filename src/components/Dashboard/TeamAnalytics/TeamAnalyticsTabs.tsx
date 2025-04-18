
import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMetricsOverview } from "./TeamMetricsOverview";
import { Client } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const SSCPerformanceTable = lazy(() => import("../SSCPerformanceTable").then(mod => ({ default: mod.SSCPerformanceTable })));
const HealthScoreSheet = lazy(() => import("../HealthScoreSheet").then(mod => ({ default: mod.HealthScoreSheet })));
const HealthScoreHistory = lazy(() => import("../HealthScoreHistory").then(mod => ({ default: mod.HealthScoreHistory })));

// Loading fallback for lazy-loaded components
const ChartSkeleton = () => (
  <div className="w-full space-y-3">
    <Skeleton className="h-[40px] w-full rounded-md" />
    <Skeleton className="h-[300px] w-full rounded-md" />
  </div>
);

interface TeamAnalyticsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  performanceData: {
    teamClients: Client[];
    statusCounts: {
      active: number;
      atRisk: number;
      churned: number;
      total: number;
    };
    rates: {
      retentionRate: number;
      atRiskRate: number;
      churnRate: number;
    };
    trends: {
      retentionTrend: number;
      atRiskTrend: number;
      churnTrend: number;
    };
    metrics: {
      totalMRR: number;
      totalCallsBooked: number;
      totalDealsClosed: number;
      clientCount?: number;
    };
  };
  csmList: string[];
  clients: Client[];
  selectedTeam: string;
}

export function TeamAnalyticsTabs({
  activeTab,
  onTabChange,
  performanceData,
  csmList,
  clients,
  selectedTeam
}: TeamAnalyticsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <div className="overflow-x-auto">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="health-scores">Health Score Sheet</TabsTrigger>
          <TabsTrigger value="health-trends">Health Trends</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="overview">
        <TeamMetricsOverview
          metrics={performanceData.metrics}
          statusCounts={performanceData.statusCounts}
          rates={{
            ...performanceData.rates,
            ...performanceData.trends
          }}
        />
      </TabsContent>
      
      <TabsContent value="performance">
        <Suspense fallback={<ChartSkeleton />}>
          <div className="overflow-x-auto">
            <SSCPerformanceTable 
              csmList={csmList}
              clients={clients}
              selectedTeam={selectedTeam}
            />
          </div>
        </Suspense>
      </TabsContent>
      
      <TabsContent value="health-scores">
        <Suspense fallback={<ChartSkeleton />}>
          <div className="overflow-x-auto">
            <HealthScoreSheet clients={performanceData.teamClients} />
          </div>
        </Suspense>
      </TabsContent>
      
      <TabsContent value="health-trends">
        <Suspense fallback={<ChartSkeleton />}>
          <HealthScoreHistory />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
