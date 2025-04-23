
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Users } from "lucide-react";

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: number;
  confidence: number;
  type: 'engagement' | 'progress' | 'success';
  actions: string[];
}

interface AIRecommendationsProps {
  clientId?: string;
  recommendations: AIRecommendation[];
}

export function AIRecommendations({ clientId, recommendations }: AIRecommendationsProps) {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'engagement':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'progress':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Brain className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Smart Recommendations</h2>
      </div>

      <div className="grid gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center space-x-2">
                    {getRecommendationIcon(rec.type)}
                    <span>{rec.title}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {rec.confidence}% confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Impact Score</span>
                  <span className="font-medium">{rec.impact}%</span>
                </div>
                <Progress value={rec.impact} className="h-2" />
                <div className="space-y-2 mt-4">
                  <span className="text-sm font-medium">Recommended Actions:</span>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    {rec.actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
