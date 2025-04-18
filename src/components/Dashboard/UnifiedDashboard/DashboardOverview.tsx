
import { Card } from "@/components/ui/card";
import { ClientMetricsSummary } from "../ConsolidatedMetrics/ClientMetricsSummary";
import { AIInsightsWidget } from "../AIInsightsWidget";
import { NPSChart } from "../NPSChart";
import { getStoredAIInsights } from "@/utils/aiDataAnalyzer";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { calculateStatusCounts, calculateRates } from "@/utils/analyticsUtils";
import { AIInsightsPanel } from "../AIInsights";

export function DashboardOverview() {
  const {
    clients,
    clientCounts,
    metrics,
    npsData,
    error
  } = useDashboardData();

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

  const rates = calculateRates(statusCounts);

  // Get NPS score from the most recent NPS data if available
  const npsScore = npsData && npsData.length > 0 ? npsData[npsData.length - 1].score : undefined;
  
  // Get growth rate from performance trends if available
  // Ensure performanceTrends is an array before accessing its length property
  const performanceTrends = metrics?.performanceTrends || [];
  const growthRate = Array.isArray(performanceTrends) && performanceTrends.length > 0 
    ? performanceTrends[0].percentChange 
    : undefined;

  const consolidatedMetrics = {
    total: statusCounts.total,
    active: statusCounts.active,
    atRisk: statusCounts.atRisk,
    newClients: statusCounts.new,
    churn: rates.churnRate,
    success: rates.retentionRate,
    mrr: metrics?.totalMRR || 0,
    nps: npsScore,
    growthRate: growthRate
  };

  const performanceData = {
    totalMRR: metrics?.totalMRR || 0,
    totalCallsBooked: metrics?.totalCallsBooked || 0,
    totalDealsClosed: metrics?.totalDealsClosed || 0,
    totalClients: statusCounts.total
  };

  return (
    <div className="space-y-6">
      <ClientMetricsSummary 
        metrics={consolidatedMetrics}
        statusCounts={statusCounts}
        rates={rates}
        performanceData={performanceData}
      />
      
      {/* AI Insights Panel */}
      <AIInsightsPanel 
        clients={clients || []}
        metrics={metrics || {}}
        statusCounts={statusCounts}
        rates={rates}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <NPSChart />
          </div>
        </Card>
        
        <AIInsightsWidget insights={getStoredAIInsights()} />
      </div>
    </div>
  );
}
