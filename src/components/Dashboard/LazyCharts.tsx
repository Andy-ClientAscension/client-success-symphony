
import React, { lazy, Suspense, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";

// Lazy load chart components with appropriate chunk names
const ChurnChart = lazy(() => 
  import(/* webpackChunkName: "churn-chart" */ "./ChurnChart").then(mod => ({ default: mod.ChurnChart }))
);
const NPSChart = lazy(() => 
  import(/* webpackChunkName: "nps-chart" */ "./NPSChart").then(mod => ({ default: mod.NPSChart }))
);

// Resource preload hint component
const ChartResourceHint = ({ chartType }: { chartType: 'churn' | 'nps' }) => {
  useEffect(() => {
    // Preload the component when it's about to be needed
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'script';
    link.href = chartType === 'churn' 
      ? '/src/components/Dashboard/ChurnChart.tsx'
      : '/src/components/Dashboard/NPSChart.tsx';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, [chartType]);
  
  return null;
};

export function LazyChurnChart() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-semibold">Company Churn Rate</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ChartResourceHint chartType="churn" />
        <Suspense fallback={<ChartSkeleton height={220} />}>
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
        <ChartResourceHint chartType="nps" />
        <Suspense fallback={<ChartSkeleton height={220} showLegend={true} />}>
          <NPSChart />
        </Suspense>
      </CardContent>
    </Card>
  );
}
