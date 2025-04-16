
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Bot, RefreshCw, AlertTriangle, 
  TrendingUp, LineChart, BarChart2, PieChart 
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

export default function AIDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefetching, setIsRefetching] = useState(false);
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
  
  const isRefreshing = queryClient.isFetching({queryKey: ['ai-insights']}) > 0 || isRefetching;

  // Use the AI insights hook to get insights and predictions
  const { 
    insights, 
    predictions, 
    isAnalyzing, 
    analyzeClients, 
    getHighRiskClients, 
    getHighGrowthClients 
  } = useAIInsights(clients);

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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshAnalysis}
              disabled={isAnalyzing}
              className="h-8 gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
          </div>
        </div>
        
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
                    <ClientHealthAnalysis predictions={predictions} />
                    <RiskOpportunityMap predictions={predictions} />
                  </div>
                </TabsContent>
                
                <TabsContent value="trends" className="space-y-6">
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
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-6">
                  <RecommendationsEngine insights={insights} />
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
          )}
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
