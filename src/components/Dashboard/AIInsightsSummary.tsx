
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, AlertCircle, TrendingUp, ExternalLink } from "lucide-react";
import { AIInsight, getStoredAIInsights } from '@/utils/aiDataAnalyzer';
import { useEffect, useState } from "react";

export function AIInsightsSummary() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  
  useEffect(() => {
    const storedInsights = getStoredAIInsights();
    setInsights(storedInsights);
  }, []);
  
  const getHighPriorityInsights = () => {
    return insights.filter(insight => insight.severity === 'high');
  };
  
  const getRecommendations = () => {
    return insights.filter(insight => insight.type === 'recommendation');
  };
  
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Bot className="h-4 w-4 mr-2 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              No AI insights available. Generate insights to get recommendations.
            </p>
            <Button onClick={() => navigate('/ai-dashboard')} variant="secondary" size="sm">
              <Bot className="h-3.5 w-3.5 mr-1.5" />
              Generate Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-4 w-4 mr-2 text-primary" />
            AI Insights
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs" 
            onClick={() => navigate('/ai-dashboard')}
          >
            View All
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {getHighPriorityInsights().length > 0 && (
            <div className="border-l-2 border-red-500 pl-3 py-1">
              <div className="flex items-center text-sm font-medium text-red-600 mb-1">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                High Priority
              </div>
              <p className="text-sm">{getHighPriorityInsights()[0].message}</p>
            </div>
          )}
          
          {getRecommendations().length > 0 && (
            <div className="border-l-2 border-green-500 pl-3 py-1">
              <div className="flex items-center text-sm font-medium text-green-600 mb-1">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                Recommendation
              </div>
              <p className="text-sm">{getRecommendations()[0].message}</p>
            </div>
          )}
          
          <Button 
            onClick={() => navigate('/ai-dashboard')} 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
          >
            <Bot className="h-3.5 w-3.5 mr-1.5" />
            View AI Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
