
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ClientPrediction } from "@/hooks/use-ai-insights";
import { AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

interface ClientHealthAnalysisProps {
  predictions: ClientPrediction[];
}

export function ClientHealthAnalysis({ predictions }: ClientHealthAnalysisProps) {
  const [sortBy, setSortBy] = useState<'churnRisk' | 'growthPotential'>('churnRisk');
  const [filterType, setFilterType] = useState<string>('all');
  
  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortBy === 'churnRisk') {
      return b.churnRisk - a.churnRisk;
    } else {
      return b.growthPotential - a.growthPotential;
    }
  });
  
  const filteredPredictions = sortedPredictions.filter(prediction => {
    if (filterType === 'all') return true;
    if (filterType === 'highRisk') return prediction.churnRisk > 70;
    if (filterType === 'highGrowth') return prediction.growthPotential > 70;
    if (filterType === 'needsAttention') {
      return prediction.churnRisk > 50 || prediction.growthPotential > 70;
    }
    return true;
  });
  
  const getRiskColor = (risk: number) => {
    if (risk > 70) return "bg-red-500";
    if (risk > 40) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const getGrowthColor = (potential: number) => {
    if (potential > 70) return "bg-green-500";
    if (potential > 40) return "bg-blue-500";
    return "bg-gray-500";
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg">
            Predictive Client Health Analysis
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="highRisk">High Risk</SelectItem>
                <SelectItem value="highGrowth">High Growth</SelectItem>
                <SelectItem value="needsAttention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="churnRisk">Churn Risk</SelectItem>
                <SelectItem value="growthPotential">Growth Potential</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPredictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No clients match the current filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <h3 className="font-medium">{prediction.name}</h3>
                  <Badge 
                    variant={prediction.churnRisk > 70 ? "destructive" : 
                           prediction.growthPotential > 70 ? "success" : "outline"}
                  >
                    {prediction.recommendedAction}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center text-sm">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-500" />
                        Churn Risk
                      </div>
                      <span className="text-sm font-semibold">{prediction.churnRisk}%</span>
                    </div>
                    <Progress 
                      value={prediction.churnRisk} 
                      max={100} 
                      className="h-2"
                      indicatorClassName={getRiskColor(prediction.churnRisk)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center text-sm">
                        <TrendingUp className="h-3.5 w-3.5 mr-1 text-green-500" />
                        Growth Potential
                      </div>
                      <span className="text-sm font-semibold">{prediction.growthPotential}%</span>
                    </div>
                    <Progress 
                      value={prediction.growthPotential} 
                      max={100} 
                      className="h-2"
                      indicatorClassName={getGrowthColor(prediction.growthPotential)}
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground">
                  {prediction.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
