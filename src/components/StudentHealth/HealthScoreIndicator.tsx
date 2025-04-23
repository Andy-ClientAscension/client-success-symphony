
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRiskCategory, RISK_CATEGORIES } from '@/utils/healthScoreUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HealthScoreIndicatorProps {
  score: number;
  previousScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function HealthScoreIndicator({
  score,
  previousScore,
  size = 'md',
  showDetails = true,
  className
}: HealthScoreIndicatorProps) {
  const riskCategory = getRiskCategory(score);
  const scoreDiff = previousScore !== undefined ? score - previousScore : 0;
  const trendDirection = scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : 'stable';
  
  // Determine size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-2',
          title: 'text-sm',
          score: 'text-xl',
          progress: 'h-1.5'
        };
      case 'lg':
        return {
          card: 'p-6',
          title: 'text-lg',
          score: 'text-4xl',
          progress: 'h-3'
        };
      default:
        return {
          card: 'p-4',
          title: 'text-base',
          score: 'text-2xl',
          progress: 'h-2'
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  // Get color classes for the score
  const getColorClasses = () => {
    switch (riskCategory.level) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Determine trend icon
  const TrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Calculate warning threshold for alert
  const isAtRisk = riskCategory.level === 'high' || riskCategory.level === 'critical';
  
  return (
    <Card className={cn("overflow-hidden", className, sizeClasses.card)}>
      <CardHeader className="p-3 pb-2">
        <CardTitle className={cn("font-semibold", sizeClasses.title)}>Health Score</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("font-bold", getColorClasses(), sizeClasses.score)}>
              {score}
            </span>
            {trendDirection !== 'stable' && previousScore !== undefined && (
              <div className="flex items-center text-xs">
                <TrendIcon />
                <span 
                  className={cn(
                    "ml-1", 
                    trendDirection === 'up' ? "text-green-600" : "text-red-600"
                  )}
                >
                  {Math.abs(scoreDiff)}
                </span>
              </div>
            )}
          </div>
          
          {isAtRisk && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle 
                    className="h-4 w-4 text-red-500" 
                    aria-label="Student at risk"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Student at {riskCategory.level} risk level</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <Progress 
          value={score} 
          className={cn("w-full", sizeClasses.progress)}
          indicatorClassName={cn("bg-gradient-to-r", {
            "from-red-500 to-red-600": riskCategory.level === 'critical',
            "from-orange-500 to-orange-600": riskCategory.level === 'high',
            "from-yellow-500 to-yellow-600": riskCategory.level === 'medium',
            "from-green-500 to-green-600": riskCategory.level === 'low',
          })}
        />
        
        {showDetails && (
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Critical</span>
            <span>Low Risk</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
