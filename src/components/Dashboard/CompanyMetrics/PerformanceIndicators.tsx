
import React from "react";
import { PerformanceMetrics } from "../Shared";

interface PerformanceData {
  totalClients: number;
  totalMRR: number;
  totalCallsBooked: number;
  totalDealsClosed: number;
  averageRevenuePerClient: number;
}

interface PerformanceIndicatorsProps {
  data: PerformanceData;
}

export function PerformanceIndicators({ data }: PerformanceIndicatorsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Performance Metrics</h3>
      <PerformanceMetrics data={data} />
    </div>
  );
}
