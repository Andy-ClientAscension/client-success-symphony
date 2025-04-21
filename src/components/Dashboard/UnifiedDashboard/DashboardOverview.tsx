
import React, { useState } from "react";
import { UnifiedDashboardMetrics } from "../Metrics/UnifiedDashboardMetrics";
import { AIInsightsPanel } from "../AIInsights";
import { NPSChart } from "../NPSChart";
import { AIInsightsWidget } from "../AIInsightsWidget";
import { getStoredAIInsights } from "@/utils/aiDataAnalyzer";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function DashboardOverview() {
  const {
    clients,
    clientCounts,
    metrics,
    npsData,
    error
  } = useDashboardData();
  
  const [insightsPanelExpanded, setInsightsPanelExpanded] = useState(true);
  const [chartsPanelExpanded, setChartsPanelExpanded] = useState(true);

  if (error) {
    return null; // Error is handled by parent component
  }

  const statusCounts = {
    active: clientCounts?.active || 0,
    atRisk: clientCounts?.["at-risk"] || 0,
    churned: clientCounts?.churned || 0,
    new: clientCounts?.new || 0,
    total: clientCounts ? Object.values(clientCounts).reduce((a, b) => a + b, 0) : 0
  };

  const rates = {
    retentionRate: statusCounts.total > 0 ? Math.round((statusCounts.active / statusCounts.total) * 100) : 0,
    atRiskRate: statusCounts.total > 0 ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) : 0,
    churnRate: statusCounts.total > 0 ? Math.round((statusCounts.churned / statusCounts.total) * 100) : 0
  };

  // Properly check if npsData is an array before accessing length property
  const lastNpsScore = Array.isArray(npsData?.trend) && npsData.trend.length > 0 
    ? npsData.trend[npsData.trend.length - 1].score 
    : (npsData?.current || 0);

  const consolidatedMetrics = {
    total: statusCounts.total,
    active: statusCounts.active,
    atRisk: statusCounts.atRisk,
    newClients: clientCounts?.new || 0,
    churn: rates.churnRate,
    success: rates.retentionRate,
    mrr: metrics?.totalMRR || 0,
    nps: lastNpsScore,
    growthRate: metrics?.performanceTrends?.[0]?.percentChange
  };

  const performanceData = {
    totalMRR: metrics?.totalMRR || 0,
    totalCallsBooked: metrics?.totalCallsBooked || 0,
    totalDealsClosed: metrics?.totalDealsClosed || 0,
    totalClients: statusCounts.total
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Section */}
      <UnifiedDashboardMetrics 
        metrics={consolidatedMetrics}
        statusCounts={statusCounts}
        rates={rates}
        performanceData={performanceData}
      />
      
      {/* AI Insights Panel */}
      <Collapsible open={insightsPanelExpanded} onOpenChange={setInsightsPanelExpanded}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">AI Insights</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {insightsPanelExpanded ? (
                <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" /> Expand</>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <AIInsightsPanel 
            clients={clients || []}
            metrics={metrics || {}}
            statusCounts={statusCounts}
            rates={rates}
          />
        </CollapsibleContent>
      </Collapsible>
      
      {/* Charts Panel */}
      <Collapsible open={chartsPanelExpanded} onOpenChange={setChartsPanelExpanded}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Performance Charts</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {chartsPanelExpanded ? (
                <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" /> Expand</>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <h3 className="text-base font-semibold mb-4">NPS Trend</h3>
                <NPSChart />
              </div>
            </Card>
            
            <AIInsightsWidget insights={getStoredAIInsights()} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
