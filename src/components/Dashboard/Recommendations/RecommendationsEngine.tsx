
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsight } from "@/utils/aiDataAnalyzer";
import { AlertCircle, TrendingUp, Lightbulb, ExternalLink } from "lucide-react";

interface RecommendationsEngineProps {
  insights: AIInsight[];
}

export function RecommendationsEngine({ insights }: RecommendationsEngineProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const filteredInsights = activeTab === "all" 
    ? insights 
    : insights.filter(insight => insight.type === activeTab);
  
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'recommendation':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'improvement':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getActionButtonText = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'Resolve Issue';
      case 'recommendation':
        return 'Implement';
      case 'improvement':
        return 'Apply Change';
      default:
        return 'Take Action';
    }
  };
  
  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-500 border-red-500';
      case 'medium':
        return 'text-amber-500 border-amber-500';
      case 'low':
        return 'text-blue-500 border-blue-500';
      default:
        return 'text-blue-500 border-blue-500';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Automated Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="warning">Warnings</TabsTrigger>
            <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
            <TabsTrigger value="improvement">Improvements</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredInsights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No insights available for this category. Generate insights to see recommendations.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <p className="font-medium">{insight.message}</p>
                          {insight.affectedClients && insight.affectedClients.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Affects: {insight.affectedClients.join(', ')}
                            </p>
                          )}
                          <div className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mt-2 ${getSeverityColor(insight.severity)}`}>
                            {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)} Priority
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0">
                        {getActionButtonText(insight.type)}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
