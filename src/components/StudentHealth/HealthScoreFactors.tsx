
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface HealthScoreFactorsProps {
  factors: StudentHealth.HealthScoreFactors;
  className?: string;
}

export function HealthScoreFactors({ factors, className }: HealthScoreFactorsProps) {
  // Factor definitions with labels and color mapping
  const factorDefinitions = [
    { 
      key: 'engagement' as keyof StudentHealth.HealthScoreFactors, 
      label: 'Engagement',
      description: 'Student participation and activity level',
    },
    { 
      key: 'progress' as keyof StudentHealth.HealthScoreFactors, 
      label: 'Progress',
      description: 'Advancement through course material',
    },
    { 
      key: 'sentiment' as keyof StudentHealth.HealthScoreFactors, 
      label: 'Sentiment',
      description: 'Student attitude and satisfaction',
    },
    { 
      key: 'attendance' as keyof StudentHealth.HealthScoreFactors, 
      label: 'Attendance',
      description: 'Presence in sessions and calls',
    },
    { 
      key: 'completion' as keyof StudentHealth.HealthScoreFactors, 
      label: 'Completion',
      description: 'Task and assignment completion rate',
    },
  ];
  
  // Get color based on score value
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    if (score >= 30) return 'bg-orange-600';
    return 'bg-red-600';
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Health Score Factors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {factorDefinitions.map((factor) => (
            <div key={factor.key} className="space-y-1">
              <div className="flex justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">{factor.label}</div>
                  <div className="text-xs text-muted-foreground">{factor.description}</div>
                </div>
                <div className={cn(
                  "text-sm font-bold", 
                  factors[factor.key] >= 80 ? "text-green-600" : 
                  factors[factor.key] >= 60 ? "text-yellow-600" : 
                  factors[factor.key] >= 30 ? "text-orange-600" : 
                  "text-red-600"
                )}>
                  {factors[factor.key]}
                </div>
              </div>
              <Progress 
                value={factors[factor.key]} 
                className="h-2"
                indicatorClassName={getProgressColor(factors[factor.key])}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
