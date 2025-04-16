
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot, RefreshCw, BarChart2, PieChart, LineChart, TrendingUp, AlertCircle } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useQueryClient } from "@tanstack/react-query";
import { AIInsight, analyzeClientData, getStoredAIInsights } from '@/utils/aiDataAnalyzer';
import { getAllClients, Client } from '@/lib/data';
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { ChartContainer } from "@/components/ui/chart";
import { ClientAnalytics } from "@/components/Dashboard/ClientAnalytics";
import { AIInsightsWidget } from "@/components/Dashboard/AIInsightsWidget";

export default function AIDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefetching, setIsRefetching] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const isRefreshing = queryClient.isFetching({queryKey: ['ai-insights']}) > 0 || isRefetching;

  useEffect(() => {
    // Get all clients
    const allClients = getAllClients();
    setClients(allClients);
    
    // Get stored AI insights
    const insights = getStoredAIInsights();
    setAIInsights(insights);
  }, []);

  const handleRefreshAnalysis = useCallback(async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    toast({
      title: "Analyzing Client Data",
      description: "Our AI is analyzing your client data. This might take a moment.",
      duration: 3000,
    });
    
    try {
      const insights = await analyzeClientData(clients);
      setAIInsights(insights);
      
      toast({
        title: "Analysis Complete",
        description: `Generated ${insights.length} insights from your client data.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to complete client data analysis. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [clients, toast, isAnalyzing]);

  const getInsightsByType = (type: AIInsight['type']) => {
    return aiInsights.filter(insight => insight.type === type);
  };

  const handleErrorReset = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
  }, [queryClient]);

  return (
    <Layout>
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
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
        
        <div className="space-y-6">
          <ErrorBoundary onReset={handleErrorReset}>
            {aiInsights.length > 0 ? (
              <AIInsightsWidget insights={aiInsights} />
            ) : (
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
            )}
          </ErrorBoundary>
          
          {aiInsights.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                      Warnings ({getInsightsByType('warning').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getInsightsByType('warning').length > 0 ? (
                      getInsightsByType('warning').slice(0, 3).map((insight, index) => (
                        <div key={index} className="border-l-2 border-yellow-500 pl-3 py-1">
                          <p className="text-sm">{insight.message}</p>
                          {insight.affectedClients && (
                            <p className="text-xs text-muted-foreground">
                              Affects: {insight.affectedClients.join(', ')}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No warnings detected</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                      Recommendations ({getInsightsByType('recommendation').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getInsightsByType('recommendation').length > 0 ? (
                      getInsightsByType('recommendation').slice(0, 3).map((insight, index) => (
                        <div key={index} className="border-l-2 border-green-500 pl-3 py-1">
                          <p className="text-sm">{insight.message}</p>
                          {insight.affectedClients && (
                            <p className="text-xs text-muted-foreground">
                              For: {insight.affectedClients.join(', ')}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recommendations available</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                      Improvements ({getInsightsByType('improvement').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getInsightsByType('improvement').length > 0 ? (
                      getInsightsByType('improvement').slice(0, 3).map((insight, index) => (
                        <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                          <p className="text-sm">{insight.message}</p>
                          {insight.affectedClients && (
                            <p className="text-xs text-muted-foreground">
                              Focus on: {insight.affectedClients.join(', ')}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No improvements suggested</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <NPSChart />
                  </div>
                </CardContent>
              </Card>
              
              <ClientAnalytics />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
