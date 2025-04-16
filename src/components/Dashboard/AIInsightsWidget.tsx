
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { AIInsight } from '@/utils/aiDataAnalyzer';

interface AIInsightsWidgetProps {
  insights: AIInsight[];
}

export function AIInsightsWidget({ insights }: AIInsightsWidgetProps) {
  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'recommendation': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'improvement': return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  if (insights.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-red-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.map((insight, index) => (
          <Alert key={index} variant={insight.severity === 'high' ? 'destructive' : 'default'}>
            {getIcon(insight.type)}
            <AlertTitle>{insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}</AlertTitle>
            <AlertDescription>{insight.message}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
