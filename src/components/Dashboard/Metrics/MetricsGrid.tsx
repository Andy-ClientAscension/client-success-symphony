
import React from "react";
import { MetricCard } from "./MetricCard";

interface MetricsGridProps {
  totalClients: number;
  growthRate: number;
  clientCounts: {
    active: number;
    "at-risk": number;
    new: number;
  };
  percentages: {
    activeClientsPercentage: number;
    atRiskPercentage: number;
    newPercentage: number;
  };
  successRate: number;
  churnRate: number;
}

export function MetricsGrid({
  totalClients,
  growthRate,
  clientCounts,
  percentages,
  successRate,
  churnRate
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
      <MetricCard 
        title="Total Clients" 
        value={totalClients}
        trend={{
          value: `+${growthRate}% growth`,
          direction: "up"
        }}
      />
      
      <MetricCard 
        title="Active Clients" 
        value={clientCounts.active}
        badge={{
          value: `${percentages.activeClientsPercentage}%`,
          variant: "green"
        }}
      />
      
      <MetricCard 
        title="At Risk" 
        value={clientCounts["at-risk"]}
        badge={{
          value: `${percentages.atRiskPercentage}%`,
          variant: "amber"
        }}
      />
      
      <MetricCard 
        title="New Clients" 
        value={clientCounts.new}
        badge={{
          value: `${percentages.newPercentage}%`,
          variant: "blue"
        }}
      />
      
      <MetricCard 
        title="Success Rate" 
        value={`${successRate}%`}
        trend={{
          value: "+2.5% this quarter",
          direction: "up"
        }}
      />
      
      <MetricCard 
        title="Churn Rate" 
        value={`${churnRate}%`}
        trend={{
          value: "-0.2% this month",
          direction: "down"
        }}
      />
    </div>
  );
}
