
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMetricsOverview } from "./TeamMetricsOverview";
import { SSCPerformanceTable } from "../SSCPerformanceTable";
import { HealthScoreSheet } from "../HealthScoreSheet";
import { HealthScoreHistory } from "../HealthScoreHistory";
import { Client } from "@/lib/data";

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
        <div className="overflow-x-auto">
          <SSCPerformanceTable 
            csmList={csmList}
            clients={clients}
            selectedTeam={selectedTeam}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="health-scores">
        <div className="overflow-x-auto">
          <HealthScoreSheet clients={performanceData.teamClients} />
        </div>
      </TabsContent>
      
      <TabsContent value="health-trends">
        <HealthScoreHistory />
      </TabsContent>
    </Tabs>
  );
}
