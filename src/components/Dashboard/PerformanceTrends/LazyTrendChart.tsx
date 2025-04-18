
import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the TrendChart component
const TrendChart = lazy(() => import("./TrendChart").then(mod => ({ default: mod.TrendChart })));

// Loading fallback for the chart
const ChartSkeleton = () => (
  <div className="w-full space-y-3">
    <Skeleton className="h-[40px] w-full rounded-md" />
    <Skeleton className="h-[300px] w-full rounded-md" />
  </div>
);

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
    <Suspense fallback={<ChartSkeleton />}>
      <TrendChart {...props} />
    </Suspense>
  );
}
