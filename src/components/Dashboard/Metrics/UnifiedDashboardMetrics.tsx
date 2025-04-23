import React from "react";
import { HeroMetrics } from "./HeroMetrics";

interface UnifiedDashboardMetricsProps {
  metrics: any;
  statusCounts: any;
  rates: any;
  performanceData: any;
  variant?: string;
}

export function UnifiedDashboardMetrics({
  variant = "default"
}: UnifiedDashboardMetricsProps) {
  return (
    <div className="space-y-6">
      <HeroMetrics className="mb-6" />
    </div>
  );
}
