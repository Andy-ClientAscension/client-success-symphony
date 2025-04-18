
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Bot, RefreshCw, TrendingUp, Brain, AlertTriangle, ChartBarHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateClientInsights } from "./aiInsightsService";
import { AIInsight } from '@/utils/aiDataAnalyzer';
import { hasOpenAIKey } from '@/lib/openai';
import { OpenAIKeyInput } from './OpenAIKeyInput';

interface AIInsightsPanelProps {
  clients: any[];
  metrics: any;
  statusCounts: {
    active: number;
    atRisk: number;
    churned: number;
    new: number;
    total: number;
  };
  rates: {
    churnRate: number;
    retentionRate: number;
    atRiskRate: number;
  };
}

export function AIInsightsPanel({ 
  clients, 
  metrics, 
  statusCounts, 
  rates 
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState('churn');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(hasOpenAIKey());
  const { toast } = useToast();

  const generateInsights = async () => {
    if (!hasApiKey) {
      setError("OpenAI API key is required to generate insights");
      return;
    }
    
    if (!clients || clients.length === 0) {
      setError("No client data available for analysis");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedInsights = await generateClientInsights(clients, metrics, statusCounts, rates);
      setInsights(generatedInsights);
      toast({
        title: "Analysis Complete",
        description: "AI has generated new insights for your dashboard",
      });
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Failed to generate insights. Please try again later.");
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have an API key whenever the component mounts
    setHasApiKey(hasOpenAIKey());
  }, []);

  const handleApiKeySubmit = () => {
    setHasApiKey(hasOpenAIKey());
    if (hasOpenAIKey()) {
      generateInsights();
    }
  };

  const getInsightsByCategory = (category: string) => {
    return insights.filter(insight => {
      if (category === 'churn') {
        return insight.message.toLowerCase().includes('churn') || 
               insight.message.toLowerCase().includes('at-risk') || 
               insight.message.toLowerCase().includes('retention');
      } else if (category === 'revenue') {
        return insight.message.toLowerCase().includes('revenue') || 
               insight.message.toLowerCase().includes('mrr') || 
               insight.message.toLowerCase().includes('income');
      } else if (category === 'growth') {
        return insight.message.toLowerCase().includes('growth') || 
               insight.message.toLowerCase().includes('opportunity') || 
               insight.message.toLowerCase().includes('potential');
      }
      return true; // For 'all' category
    });
  };

  // Get the appropriate icon for the insight type
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'recommendation':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'improvement':
        return <ChartBarHorizontal className="h-4 w-4 text-blue-500" />;
      default:
        return <Bot className="h-4 w-4 text-primary" />;
    }
  };

  // Get the severity badge color
  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Connect OpenAI API to analyze your client data and get actionable insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OpenAIKeyInput onSubmit={handleApiKeySubmit} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Analyzing..." : "Generate Insights"}
          </Button>
        </div>
        <CardDescription>
          AI-powered analysis of your client data and business trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="churn">Churn</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4 space-y-4">
                {getInsightsByCategory(activeTab).map((insight, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-card">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {insight.type}
                          </span>
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(insight.severity)}`}>
                            {insight.severity} priority
                          </Badge>
                        </div>
                        <p className="text-sm">{insight.message}</p>
                        {insight.affectedClients && insight.affectedClients.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Affects: {insight.affectedClients.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getInsightsByCategory(activeTab).length === 0 && (
                  <div className="text-center p-6 text-muted-foreground">
                    No {activeTab} insights available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No insights yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Generate AI insights to get actionable recommendations for improving client retention and revenue.
            </p>
            <Button onClick={generateInsights} disabled={isLoading}>
              <Bot className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
