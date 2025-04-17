
import { useState, useCallback, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Bot, RefreshCw, AlertTriangle, 
  TrendingUp, LineChart, BarChart2, PieChart,
  Home, ChevronDown, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getCompanyMetrics, 
  calculateStatusCounts, 
  calculateRates,
  calculateTeamMetrics
} from "@/utils/analyticsUtils";

// Import components from both dashboards
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { AIInsightsWidget } from "@/components/Dashboard/AIInsightsWidget";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { ClientHealthAnalysis } from "@/components/Dashboard/PredictiveAnalysis";
import { RiskOpportunityMap } from "@/components/Dashboard/RiskOpportunity";
import { TrendChart, ComparativeTrends } from "@/components/Dashboard/PerformanceTrends";
import { RecommendationsEngine } from "@/components/Dashboard/Recommendations";
import { ClientAnalytics } from "@/components/Dashboard/ClientAnalytics";
import { TeamAnalytics } from "@/components/Dashboard/TeamAnalytics";

// Import AI Insights hooks
import { useAIInsights } from '@/hooks/use-ai-insights';
import { useSystemHealth } from '@/hooks/use-system-health';
import { getAllClients, Client } from '@/lib/data';
import { 
  generateClientComparisons,
  getStoredAIInsights  
} from '@/utils/aiDataAnalyzer';

export default function UnifiedDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [aiActiveTab, setAiActiveTab] = useState("health");
  const [isRefetching, setIsRefetching] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [comparisons, setComparisons] = useState([]);
  const { healthChecks, runSystemHealthCheck } = useSystemHealth();
  
  // Trend data for charts
  const [trendData, setTrendData] = useState([
    { month: 'Jan', mrr: 2500, churn: 5, growth: 15 },
    { month: 'Feb', mrr: 3000, churn: 4, growth: 20 },
    { month: 'Mar', mrr: 3200, churn: 6, growth: 10 },
    { month: 'Apr', mrr: 4000, churn: 3, growth: 25 },
    { month: 'May', mrr: 4200, churn: 2, growth: 12 },
    { month: 'Jun', mrr: 5000, churn: 4, growth: 18 },
  ]);
  
  const isRefreshing = queryClient.isFetching({queryKey: ['ai-insights']}) > 0 || 
                       queryClient.isFetching({queryKey: ['nps-data']}) > 0 || 
                       isRefetching;

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

  // Company metrics calculation
  const metrics = getCompanyMetrics(clients);
  
  // Calculate status counts and rates
  const statusCounts = calculateStatusCounts(clients);
  const rates = calculateRates(statusCounts);

  const handleRefreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefetching(true);
    
    // Run health check if on AI tab
    if (activeTab === "ai-insights") {
      runSystemHealthCheck();
    }
    
    try {
      // Refresh AI analysis
      await analyzeClients(true);
      
      // Refresh metric data
      const newComparisons = generateClientComparisons(clients);
      setComparisons(newComparisons);
      
      // Invalidate and refetch all relevant queries
      await queryClient.invalidateQueries({
        queryKey: ['nps-data', 'ai-insights'],
        refetchType: 'active',
      });
      
      toast({
        title: "Refreshing data",
        description: "Your dashboard data is being updated.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error refreshing data",
        description: error instanceof Error ? error.message : "An error occurred refreshing the data.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRefetching(false);
    }
  }, [isRefreshing, queryClient, toast, activeTab, analyzeClients, clients, runSystemHealthCheck]);

  const handleErrorReset = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['nps-data', 'ai-insights'] });
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
            <h2 className="text-xl font-bold">Unified Dashboard</h2>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="h-8 gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            
            <Button asChild variant="destructive" className="text-white bg-red-600 hover:bg-red-700 h-8 gap-1">
              <Link to="/">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
        
        <ErrorBoundary onReset={handleErrorReset}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">
                <LineChart className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="team-analytics">
                <PieChart className="h-4 w-4 mr-2" />
                Team Analytics
              </TabsTrigger>
              <TabsTrigger value="client-analytics">
                <BarChart2 className="h-4 w-4 mr-2" />
                Client Analytics
              </TabsTrigger>
              <TabsTrigger value="ai-insights">
                <Bot className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab - Key metrics and charts */}
            <TabsContent value="overview" className="space-y-6">
              <MetricsCards />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Growth & Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
                        <div className="text-xl font-semibold text-green-600">12%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Avg. Client Value</div>
                        <div className="text-xl font-semibold">$1200</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Client Lifetime</div>
                        <div className="text-xl font-semibold">14.5 months</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Time to Value</div>
                        <div className="text-xl font-semibold">3.2 months</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NPSChart />
                  </CardContent>
                </Card>
              </div>
              
              {/* AI Insights Widget */}
              <AIInsightsWidget insights={insights || getStoredAIInsights()} />
              
              {/* Client Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Status Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">Retention Rate</div>
                        <div className="text-sm font-semibold text-green-600">{rates.retentionRate}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${rates.retentionRate}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-600">{statusCounts.active} active clients</div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">At Risk Rate</div>
                        <div className="text-sm font-semibold text-amber-600">{rates.atRiskRate}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${rates.atRiskRate}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-600">{statusCounts.atRisk} at-risk clients</div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">Churn Rate</div>
                        <div className="text-sm font-semibold text-red-600">{rates.churnRate}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${rates.churnRate}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-600">{statusCounts.churned} churned clients</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Team Analytics Tab */}
            <TabsContent value="team-analytics">
              <TeamAnalytics />
            </TabsContent>
            
            {/* Client Analytics Tab */}
            <TabsContent value="client-analytics">
              <ClientAnalytics />
            </TabsContent>
            
            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="space-y-6">
              {predictions.length === 0 ? (
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
              ) : (
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
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
