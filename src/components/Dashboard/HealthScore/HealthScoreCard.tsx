
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  score: number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
  };
  factors?: {
    label: string;
    impact: 'positive' | 'negative';
    value: string;
  }[];
}

export function HealthScoreCard({ score, trend, factors }: HealthScoreCardProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 75) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-600' };
    if (score >= 50) return { level: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-600' };
    return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-600' };
  };

  const riskStatus = getRiskLevel(score);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={cn("h-5 w-5", riskStatus.color)} />
            <h3 className="font-semibold">Health Score</h3>
          </div>
          <span className={cn("text-sm font-medium", riskStatus.color)}>
            {riskStatus.level} Risk
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-2xl font-bold", riskStatus.color)}>
                {score}%
              </span>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {trend.value}% {trend.direction === 'up' ? 'increase' : 'decrease'}
                  </span>
                </div>
              )}
            </div>
            <Progress 
              value={score} 
              className="h-2" 
              indicatorClassName={cn(riskStatus.bgColor)}
            />
          </div>

          {factors && factors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Key Factors</h4>
              <div className="space-y-1">
                {factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{factor.label}</span>
                    <span className={cn(
                      factor.impact === 'positive' ? 'text-green-600' : 'text-red-600',
                      "font-medium"
                    )}>
                      {factor.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
