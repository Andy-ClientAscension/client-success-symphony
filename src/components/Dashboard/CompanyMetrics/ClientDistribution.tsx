
import React from "react";
import { StatusDistribution } from "../Shared";

interface ClientDistributionProps {
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
}

export function ClientDistribution({ statusCounts, rates }: ClientDistributionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Client Status Distribution</h3>
      <StatusDistribution 
        statusCounts={statusCounts}
        rates={rates}
      />
    </div>
  );
}
