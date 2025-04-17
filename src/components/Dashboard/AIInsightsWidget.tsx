
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { AIInsight } from '@/utils/aiDataAnalyzer';

interface AIInsightsWidgetProps {
  insights: AIInsight[];
}

export function AIInsightsWidget({ insights }: AIInsightsWidgetProps) {
  // Validate inputs and provide defaults
  const validInsights = React.useMemo(() => {
    if (!insights || !Array.isArray(insights)) return [];
    
    return insights.filter(insight => 
      insight && 
      typeof insight === 'object' && 
      insight.type && 
      insight.message && 
      insight.severity
    );
  }, [insights]);
  
  // If no valid insights, don't render component
  if (validInsights.length === 0) return null;

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'recommendation': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'improvement': return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mb-4 bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Bot className="h-4 w-4 mr-2 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {validInsights.slice(0, 3).map((insight, index) => (
          <Alert 
            key={index} 
            variant={insight.severity === 'high' ? 'destructive' : 'default'}
            className="p-2"
          >
            {getIcon(insight.type)}
            <AlertTitle className="text-xs">{insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}</AlertTitle>
            <AlertDescription className="text-xs">{insight.message}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
