
import React, { useState, lazy, Suspense, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, RefreshCw, AlertTriangle, TrendingUp, BarChart2, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemHealth } from "@/hooks/use-system-health";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LazyRiskOpportunityMap } from "../RiskOpportunity";
import { LazyTrendChart } from "../PerformanceTrends";
import { LoadingState } from "@/components/LoadingState";
import { BackgroundProcessingIndicator, BackgroundTaskStatus } from "../BackgroundProcessingIndicator";
import { useToast } from "@/hooks/use-toast";

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
  error?: Error | null;
  comparisons: any[];
  handleRefreshData: () => void;
  cancelAnalysis?: () => void;
  trendData: any[];
  lastAnalyzed?: Date | null;
}

export function AIInsightsTab({
  predictions,
  insights,
  isAnalyzing,
  error,
  comparisons,
  handleRefreshData,
  cancelAnalysis,
  trendData,
  lastAnalyzed
}: AIInsightsTabProps) {
  const [aiActiveTab, setAiActiveTab] = useState("health");
  const { healthChecks } = useSystemHealth();
  const { toast } = useToast();
  
  // Track background tasks for the indicator with the proper type
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTaskStatus[]>([
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      status: 'idle'
    },
    {
      id: 'data-sync',
      name: 'Data Synchronization',
      status: 'idle'
    }
  ]);
  
  // Update background task status when analysis state changes
  useEffect(() => {
    setBackgroundTasks(prev => 
      prev.map(task => 
        task.id === 'ai-analysis' 
          ? { 
              ...task, 
              status: isAnalyzing 
                ? 'running' 
                : error 
                  ? 'error' 
                  : insights.length > 0 
                    ? 'success'
                    : 'idle',
              lastRun: isAnalyzing ? undefined : lastAnalyzed || undefined,
              message: error ? error.message : undefined
            }
          : task
      )
    );
  }, [isAnalyzing, error, insights, lastAnalyzed]);
  
  // Handle background task details view
  const handleViewBackgroundTasks = () => {
    toast({
      title: "Background Tasks Status",
      description: isAnalyzing 
        ? "AI analysis is currently running in the background" 
        : error 
          ? `Last analysis encountered an error: ${error.message}` 
          : lastAnalyzed 
            ? `Last analyzed at ${lastAnalyzed.toLocaleString()}` 
            : "No recent analysis data",
    });
  };

  if (predictions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CardContent className="pt-6">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
          <p className="text-muted-foreground mb-4">
            Click the button below to analyze your client data and generate AI insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
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
            {error && (
              <Button 
                variant="outline" 
                onClick={() => handleRefreshData()}
                className="mt-2 sm:mt-0"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>
                {error.message || "There was an error analyzing your client data."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        </Tabs>
        
        <div className="flex items-center gap-2">
          <BackgroundProcessingIndicator 
            tasks={backgroundTasks}
            onClick={handleViewBackgroundTasks}
          />
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshData}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          {isAnalyzing && cancelAnalysis && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={cancelAnalysis}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      
      {lastAnalyzed && (
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          Last analyzed: {lastAnalyzed.toLocaleString()}
        </div>
      )}
      
      {isAnalyzing && (
        <Alert className="bg-blue-50 dark:bg-blue-950/10 border-blue-200">
          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
          <AlertTitle>Analysis in Progress</AlertTitle>
          <AlertDescription>
            AI analysis is running in the background. You can continue using the dashboard.
          </AlertDescription>
        </Alert>
      )}
      
      {error && !isAnalyzing && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error During Analysis</AlertTitle>
          <AlertDescription>
            {error.message}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData} 
              className="mt-2"
            >
              Retry Analysis
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <TabsContent value="health" className="space-y-6 mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isAnalyzing ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <LoadingState message="Analyzing client health..." />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <LoadingState message="Mapping risks and opportunities..." />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Suspense fallback={<ChartSkeleton />}>
                <ClientHealthAnalysis predictions={predictions} />
              </Suspense>
              <LazyRiskOpportunityMap predictions={predictions} />
            </>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="trends" className="space-y-6 mt-0">
        {isAnalyzing ? (
          <>
            <Card>
              <CardContent className="p-6">
                <LoadingState message="Processing performance metrics..." />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <LoadingState message="Analyzing comparative trends..." />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
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
          </>
        )}
      </TabsContent>
      
      <TabsContent value="recommendations" className="space-y-6 mt-0">
        {isAnalyzing ? (
          <Card>
            <CardContent className="p-6">
              <LoadingState message="Generating recommendations..." />
            </CardContent>
          </Card>
        ) : (
          <Suspense fallback={<ChartSkeleton />}>
            <RecommendationsEngine insights={insights} />
          </Suspense>
        )}
      </TabsContent>
      
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
                  {check.type === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
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
