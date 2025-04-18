
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Bot, RefreshCw, AlertTriangle, 
  TrendingUp, LineChart, BarChart2, PieChart, Info
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useQueryClient } from "@tanstack/react-query";
import { 
  AIInsight, 
  getStoredAIInsights, 
  calculatePerformanceTrends,
  generateClientComparisons,
  ClientComparison
} from '@/utils/aiDataAnalyzer';
import { getAllClients, Client } from '@/lib/data';
import { useSystemHealth } from '@/hooks/use-system-health';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { ClientHealthAnalysis } from "@/components/Dashboard/PredictiveAnalysis";
import { TrendChart, ComparativeTrends } from "@/components/Dashboard/PerformanceTrends";
import { RecommendationsEngine } from "@/components/Dashboard/Recommendations";
import { RiskOpportunityMap } from "@/components/Dashboard/RiskOpportunity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingState } from "@/components/LoadingState";
import { BackgroundProcessingIndicator, BackgroundTaskStatus } from "@/components/Dashboard/BackgroundProcessingIndicator";

export default function AIDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [comparisons, setComparisons] = useState<ClientComparison[]>([]);
  const { healthChecks, runSystemHealthCheck } = useSystemHealth();
  
  // Trend data for charts (mock data for now)
  const [trendData, setTrendData] = useState([
    { month: 'Jan', mrr: 2500, churn: 5, growth: 15 },
    { month: 'Feb', mrr: 3000, churn: 4, growth: 20 },
    { month: 'Mar', mrr: 3200, churn: 6, growth: 10 },
    { month: 'Apr', mrr: 4000, churn: 3, growth: 25 },
    { month: 'May', mrr: 4200, churn: 2, growth: 12 },
    { month: 'Jun', mrr: 5000, churn: 4, growth: 18 },
  ]);
  
  // Use the enhanced AI insights hook with background processing
  const { 
    insights, 
    predictions, 
    isAnalyzing,
    error: aiError,
    lastAnalyzed,
    analyzeClients,
    cancelAnalysis
  } = useAIInsights(clients);
  
  // Update background task status with proper type
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
                : aiError 
                  ? 'error' 
                  : insights.length > 0 
                    ? 'success'
                    : 'idle',
              lastRun: isAnalyzing ? undefined : lastAnalyzed || undefined,
              message: aiError ? aiError.message : undefined
            }
          : task
      )
    );
  }, [isAnalyzing, aiError, insights, lastAnalyzed]);

  useEffect(() => {
    // Get all clients
    const allClients = getAllClients();
    setClients(allClients);
    
    // Generate initial comparison data
    const initialComparisons = generateClientComparisons(allClients);
    setComparisons(initialComparisons);
  }, []);

  const handleRefreshAnalysis = useCallback(async () => {
    if (isAnalyzing) return;
    
    runSystemHealthCheck();
    await analyzeClients(true);
    
    // Refresh comparison data
    const newComparisons = generateClientComparisons(clients);
    setComparisons(newComparisons);
  }, [clients, analyzeClients, isAnalyzing, runSystemHealthCheck]);

  const handleErrorReset = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
  }, [queryClient]);
  
  // Handle background task details view
  const handleViewBackgroundTasks = () => {
    toast({
      title: "Background Tasks Status",
      description: isAnalyzing 
        ? "AI analysis is currently running in the background" 
        : aiError 
          ? `Last analysis encountered an error: ${aiError.message}` 
          : lastAnalyzed 
            ? `Last analyzed at ${lastAnalyzed.toLocaleString()}` 
            : "No recent analysis data",
    });
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-xl font-bold">AI Insights Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <BackgroundProcessingIndicator 
              tasks={backgroundTasks}
              onClick={handleViewBackgroundTasks}
            />
            
            <Button 
              variant="outline" 
              onClick={handleRefreshAnalysis}
              disabled={isAnalyzing}
              className="h-8 gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
            
            {isAnalyzing && (
              <Button 
                variant="outline" 
                size="sm" 
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
        
        {aiError && !isAnalyzing && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error During Analysis</AlertTitle>
            <AlertDescription>
              {aiError.message}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshAnalysis} 
                className="mt-2"
              >
                Retry Analysis
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <ErrorBoundary onReset={handleErrorReset}>
          {predictions.length === 0 ? (
            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
                <p className="text-muted-foreground mb-4">
                  Click the button below to analyze your client data and generate AI insights.
                </p>
                <Button onClick={handleRefreshAnalysis} disabled={isAnalyzing}>
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
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="health" className="w-full">
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
                        <ClientHealthAnalysis predictions={predictions} />
                        <RiskOpportunityMap predictions={predictions} />
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="trends" className="space-y-6">
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
                      <TrendChart 
                        title="Performance Metrics Over Time"
                        data={trendData}
                        dataKeys={[
                          { name: 'mrr', color: '#3b82f6' },
                          { name: 'churn', color: '#ef4444' },
                          { name: 'growth', color: '#22c55e' }
                        ]}
                        xAxisKey="month"
                      />
                      <ComparativeTrends comparisons={comparisons} />
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-6">
                  {isAnalyzing ? (
                    <Card>
                      <CardContent className="p-6">
                        <LoadingState message="Generating recommendations..." />
                      </CardContent>
                    </Card>
                  ) : (
                    <RecommendationsEngine insights={insights} />
                  )}
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
          )}
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
