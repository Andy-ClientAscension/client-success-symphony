
import { TeamMetricCard } from "../TeamMetricCard";
import { TeamStatusMetric } from "../TeamStatusMetric";
import { CheckCircle2, AlertTriangle, ArrowDownRight } from "lucide-react";

interface TeamMetricsOverviewProps {
  metrics: {
    totalMRR: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
  };
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
    retentionTrend: number;
    atRiskTrend: number;
    churnTrend: number;
  };
}

export function TeamMetricsOverview({ metrics, statusCounts, rates }: TeamMetricsOverviewProps) {
  const getTrendIndicator = (trend: number) => {
    if (trend > 0) return "up";
    if (trend < 0) return "down";
    return "neutral";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TeamMetricCard 
          title="Total MRR" 
          value={`$${metrics.totalMRR}`}
          trend={8}
        />
        <TeamMetricCard 
          title="Calls Booked" 
          value={metrics.totalCallsBooked}
          trend={12}
        />
        <TeamMetricCard 
          title="Deals Closed" 
          value={metrics.totalDealsClosed}
          trend={5}
        />
        <TeamMetricCard 
          title="Client Count" 
          value={statusCounts.total}
          trend={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TeamStatusMetric 
          title="Retention Rate"
          value={rates.retentionRate}
          color="text-green-600"
          icon={<CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />}
          count={statusCounts.active}
          label="active clients"
          trend={{
            value: rates.retentionTrend,
            indicator: getTrendIndicator(rates.retentionTrend)
          }}
        />
        
        <TeamStatusMetric 
          title="At Risk Rate"
          value={rates.atRiskRate}
          color="text-amber-600"
          icon={<AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />}
          count={statusCounts.atRisk}
          label="at-risk clients"
          trend={{
            value: -rates.atRiskTrend,
            indicator: getTrendIndicator(-rates.atRiskTrend)
          }}
        />
        
        <TeamStatusMetric 
          title="Churn Rate"
          value={rates.churnRate}
          color="text-red-600"
          icon={<ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />}
          count={statusCounts.churned}
          label="churned clients"
          trend={{
            value: -rates.churnTrend,
            indicator: getTrendIndicator(-rates.churnTrend)
          }}
        />
      </div>
    </div>
  );
}
