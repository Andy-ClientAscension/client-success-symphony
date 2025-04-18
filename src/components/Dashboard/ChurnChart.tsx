
import React from "react";
import { TimeSeriesChart } from "./Charts/TimeSeriesChart";

export function ChurnChart() {
  const data = [
    { month: "Jan", rate: 2.1 },
    { month: "Feb", rate: 1.8 },
    { month: "Mar", rate: 2.3 },
    { month: "Apr", rate: 1.9 },
    { month: "May", rate: 2.2 },
    { month: "Jun", rate: 1.7 }
  ];

  return (
    <TimeSeriesChart
      title="Company Churn Rate"
      data={data}
      dataKey="rate"
      xAxisKey="month"
      color="#f87171"
      yAxisDomain={[0, 5]}
      referenceValue={2.0}
      valueFormatter={(value) => `${value}%`}
      yAxisLabel="Churn Rate (%)"
    />
  );
}
