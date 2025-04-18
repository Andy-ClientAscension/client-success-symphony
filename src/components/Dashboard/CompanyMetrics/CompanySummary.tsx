
import React from "react";
import { MetricsGrid } from "@/components/Dashboard/Metrics";

interface CompanySummaryProps {
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

export function CompanySummary({
  totalClients,
  growthRate,
  clientCounts,
  percentages,
  successRate,
  churnRate
}: CompanySummaryProps) {
  return (
    <MetricsGrid 
      totalClients={totalClients}
      growthRate={growthRate}
      clientCounts={clientCounts}
      percentages={percentages}
      successRate={successRate}
      churnRate={churnRate}
    />
  );
}
