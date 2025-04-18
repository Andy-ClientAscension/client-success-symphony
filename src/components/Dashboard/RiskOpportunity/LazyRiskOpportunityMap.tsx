
import React, { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientPrediction } from "@/hooks/use-ai-insights";

// Lazy load the RiskOpportunityMap component
const RiskOpportunityMap = lazy(() => 
  import("./RiskOpportunityMap").then(mod => ({ default: mod.RiskOpportunityMap }))
);

// Loading fallback for the chart
const ChartSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <Skeleton className="h-[400px] w-full rounded-md" />
    </CardContent>
  </Card>
);

interface LazyRiskOpportunityMapProps {
  predictions: ClientPrediction[];
}

export function LazyRiskOpportunityMap({ predictions }: LazyRiskOpportunityMapProps) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <RiskOpportunityMap predictions={predictions} />
    </Suspense>
  );
}
