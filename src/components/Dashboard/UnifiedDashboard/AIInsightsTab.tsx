
import React, { useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, RefreshCw, AlertTriangle, TrendingUp, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemHealth } from "@/hooks/use-system-health";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyRiskOpportunityMap } from "../RiskOpportunity";
import { LazyTrendChart } from "../PerformanceTrends";

// Lazy-loaded components
const ClientHealthAnalysis = lazy(() => 
  import("../PredictiveAnalysis").then(mod => ({ default: mod.ClientHealthAnalysis }))
);
const ComparativeTrends = lazy(() => 
  import("../PerformanceTrends").then(mod => ({ default: mod.ComparativeTrends }))
);
const RecommendationsEngine = lazy(() => 
  import("../Recommendations").then(mod => ({ default: mod.RecommendationsEngine }))
);

// Loading component for lazy-loaded content
const ChartSkeleton = () => (
  <div className="w-full space-y-3">
    <Skeleton className="h-[40px] w-full rounded-md" />
    <Skeleton className="h-[300px] w-full rounded-md" />
  </div>
);

interface AIInsightsTabProps {
  predictions: any[];
  insights: any[];
  isAnalyzing: boolean;
  comparisons: any[];
  handleRefreshData: () => void;
  trendData: any[];
}

export function AIInsightsTab({
  predictions,
  insights,
  isAnalyzing,
  comparisons,
  handleRefreshData,
  trendData
}: AIInsightsTabProps) {
  const [aiActiveTab, setAiActiveTab] = useState("health");
  const { healthChecks } = useSystemHealth();

  if (predictions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CardContent className="pt-6">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
          <p className="text-muted-foreground mb-4">
            Click the button below to analyze your client data and generate AI insights.
          </p>
          <Button onClick={handleRefreshData} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={aiActiveTab} onValueChange={setAiActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="health">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Client Health
          </TabsTrigger>
          <TabsTrigger value="trends">
            <BarChart2 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <ClientHealthAnalysis predictions={predictions} />
            </Suspense>
            <LazyRiskOpportunityMap predictions={predictions} />
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <LazyTrendChart 
            title="Performance Metrics Over Time"
            data={trendData}
            dataKeys={[
              { name: 'mrr', color: '#3b82f6' },
              { name: 'churn', color: '#ef4444' },
              { name: 'growth', color: '#22c55e' }
            ]}
            xAxisKey="month"
          />
          <Suspense fallback={<ChartSkeleton />}>
            <ComparativeTrends comparisons={comparisons} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <Suspense fallback={<ChartSkeleton />}>
            <RecommendationsEngine insights={insights} />
          </Suspense>
        </TabsContent>
      </Tabs>
      
      {healthChecks.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              System Health Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthChecks.map((check, index) => (
                <div key={index} className="flex items-start gap-2">
                  {check.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                  {check.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                  {check.type === 'info' && <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />}
                  <div>
                    <p className="text-sm">{check.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Severity: {check.severity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
