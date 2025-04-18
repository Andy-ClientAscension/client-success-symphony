
import React from "react";
import { TimeSeriesChart } from "./Charts/TimeSeriesChart";

export function NPSChart() {
  const data = [
    { month: "Jan", score: 8.2 },
    { month: "Feb", score: 7.9 },
    { month: "Mar", score: 8.5 },
    { month: "Apr", score: 8.1 },
    { month: "May", score: 8.4 },
    { month: "Jun", score: 8.7 }
  ];

  return (
    <TimeSeriesChart
      title="NPS Score Trend"
      data={data}
      dataKey="score"
      xAxisKey="month"
      color="#4ade80"
      yAxisDomain={[0, 10]}
      valueFormatter={(value) => value.toFixed(1)}
      yAxisLabel="NPS Score"
    />
  );
}
