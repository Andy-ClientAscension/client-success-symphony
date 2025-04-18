
import React, { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load chart components
const ChurnChart = lazy(() => import("./ChurnChart").then(mod => ({ default: mod.ChurnChart })));
const NPSChart = lazy(() => import("./NPSChart").then(mod => ({ default: mod.NPSChart })));

// Loading fallback for charts
const ChartSkeleton = () => (
  <div className="w-full space-y-2">
    <Skeleton className="h-[20px] w-[150px] rounded-md" />
    <Skeleton className="h-[220px] w-full rounded-md" />
  </div>
);

export function LazyChurnChart() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-semibold">Company Churn Rate</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Suspense fallback={<ChartSkeleton />}>
          <ChurnChart />
        </Suspense>
      </CardContent>
    </Card>
  );
}

export function LazyNPSChart() {
  return (
    <Card className="w-full shadow-sm mb-4">
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold">NPS Tracking</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Suspense fallback={<ChartSkeleton />}>
          <NPSChart />
        </Suspense>
      </CardContent>
    </Card>
  );
}
