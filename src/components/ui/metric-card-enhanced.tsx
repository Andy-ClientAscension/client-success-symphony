import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  status?: 'positive' | 'negative' | 'neutral' | 'warning';
  className?: string;
  valueFormatter?: (value: string | number) => string;
  isLoading?: boolean;
}

export function MetricCardEnhanced({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'neutral',
  className,
  valueFormatter = (v) => v.toString(),
  isLoading = false
}: MetricCardProps) {
  const statusStyles = {
    positive: 'border-success/20 bg-success/5 hover:bg-success/10',
    negative: 'border-destructive/20 bg-destructive/5 hover:bg-destructive/10',
    warning: 'border-warning/20 bg-warning/5 hover:bg-warning/10',
    neutral: 'border-border bg-card hover:bg-accent/50'
  };

  const trendDirection = trend?.direction || (trend?.value > 0 ? 'up' : trend?.value < 0 ? 'down' : 'neutral');
  
  const TrendIcon = trendDirection === 'up' ? TrendingUp : 
                   trendDirection === 'down' ? TrendingDown : Minus;

  const trendColorClass = trendDirection === 'up' ? 'text-success' :
                         trendDirection === 'down' ? 'text-destructive' :
                         'text-muted-foreground';

  if (isLoading) {
    return (
      <Card className={cn("transition-all duration-200 hover-lift", className)}>
        <CardContent className="p-6">
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
            <div className="h-3 bg-muted rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover-lift border",
      statusStyles[status],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between space-x-2">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {Icon && (
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <p className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {valueFormatter(value)}
              </p>
              
              {subtitle && (
                <p className="text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            {trend && (
              <div className="flex items-center space-x-1">
                <TrendIcon className={cn("h-3 w-3", trendColorClass)} />
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs border-0 px-1.5 py-0.5",
                    trendColorClass
                  )}
                >
                  {Math.abs(trend.value)}%
                </Badge>
                {trend.label && (
                  <span className="text-xs text-muted-foreground">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}