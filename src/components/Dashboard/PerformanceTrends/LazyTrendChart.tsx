
import React, { lazy, Suspense } from "react";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";

// Lazy load the TrendChart component
const TrendChart = lazy(() => import("./TrendChart").then(mod => ({ default: mod.TrendChart })));

// Props interface matching the original TrendChart component
interface LazyTrendChartProps {
  title: string;
  data: any[];
  dataKeys: {
    name: string;
    color: string;
  }[];
  xAxisKey: string;
}

export function LazyTrendChart(props: LazyTrendChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={300} showLegend={true} />}>
      <TrendChart {...props} />
    </Suspense>
  );
}
