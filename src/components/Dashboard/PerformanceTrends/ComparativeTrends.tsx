
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ClientComparison } from "@/utils/aiDataAnalyzer";
import { TrendingUp, TrendingDown, Medal } from "lucide-react";

interface ComparativeTrendsProps {
  comparisons: ClientComparison[];
}

export function ComparativeTrends({ comparisons }: ComparativeTrendsProps) {
  if (comparisons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparative Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            No comparison data available. Generate insights to see comparative trends.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Comparative Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {comparisons.map((comparison, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-medium text-sm">{comparison.metricName}</h3>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm">Industry Average</span>
                  <span className="font-medium">{comparison.averageValue.toFixed(1)}</span>
                </div>
                
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Medal className="h-4 w-4 mr-1.5 text-yellow-500" />
                  Top Performers
                </h4>
                
                <div className="space-y-2">
                  {comparison.topPerformers.map((performer, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-background rounded p-2">
                      <span className="text-sm">{performer.clientName}</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-1.5">{performer.value.toFixed(1)}</span>
                        {performer.value > comparison.averageValue ? (
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
