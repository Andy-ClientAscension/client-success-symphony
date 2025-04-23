
import { useState } from 'react';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertTriangle, TrendingUp, Users } from "lucide-react";

interface AIInsightCategory {
  id: string;
  title: string;
  description: string;
  insights: Array<{
    message: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    type: 'risk' | 'opportunity' | 'trend';
  }>;
}

export function AIInsightsEngine() {
  const { insights, predictions, isAnalyzing, error } = useAIInsights([], {
    autoAnalyze: true,
    refreshInterval: 3600000, // Refresh every hour
    silentMode: true,
  });

  const [activeCategory, setActiveCategory] = useState<string>('risks');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'trend':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const insightCategories: AIInsightCategory[] = [
    {
      id: 'risks',
      title: 'At-Risk Students',
      description: 'Students requiring immediate attention',
      insights: predictions
        .filter(p => p.churnRisk > 70)
        .map(p => ({
          message: `${p.name} has a ${p.churnRisk}% risk of churning. ${p.reason}`,
          confidence: p.churnRisk,
          impact: 'high',
          type: 'risk'
        }))
    },
    {
      id: 'opportunities',
      title: 'Growth Opportunities',
      description: 'Students showing potential for increased engagement',
      insights: predictions
        .filter(p => p.growthPotential > 70)
        .map(p => ({
          message: `${p.name} shows ${p.growthPotential}% growth potential. Consider ${p.recommendedAction}.`,
          confidence: p.growthPotential,
          impact: 'high',
          type: 'opportunity'
        }))
    }
  ];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to generate insights: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI Insights & Recommendations</h2>
      </div>

      {isAnalyzing ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 animate-pulse" />
              <p>Analyzing student data...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {insightCategories.map(category => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  {getInsightIcon(category.insights[0]?.type || '')}
                  <span>{category.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.insights.length > 0 ? (
                    category.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        {getInsightIcon(insight.type)}
                        <div className="space-y-1">
                          <p className="text-sm">{insight.message}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={insight.impact === 'high' ? 'destructive' : 'outline'}>
                              {insight.confidence}% confidence
                            </Badge>
                            <Badge variant="outline">
                              {insight.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No {category.title.toLowerCase()} detected at this time.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
