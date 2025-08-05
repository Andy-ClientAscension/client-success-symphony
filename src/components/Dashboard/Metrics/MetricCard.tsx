import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  label?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: TrendData;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  style?: React.CSSProperties;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className,
  variant = 'default',
  style 
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-primary/20 bg-primary/5',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    danger: 'border-destructive/20 bg-destructive/5'
  };

  const iconBgStyles = {
    default: 'bg-muted',
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    danger: 'bg-destructive/10'
  };

  const iconColorStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <ArrowUpIcon className="h-3 w-3 text-success" />;
      case 'down':
        return <ArrowDownIcon className="h-3 w-3 text-destructive" />;
      default:
        return <TrendingUpIcon className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card 
      className={cn(
        'card-metric p-6 hover-lift',
        variantStyles[variant],
        className
      )}
      style={style}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {value}
            </p>
            {trend && (
              <div className={cn(
                'flex items-center space-x-1 text-xs',
                getTrendColor()
              )}>
                {getTrendIcon()}
                <span>{trend.value}%</span>
                {trend.label && (
                  <span className="text-muted-foreground">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          
          <div className={cn(
            'rounded-full p-3 transition-colors',
            iconBgStyles[variant]
          )}>
            <div className={cn('h-5 w-5', iconColorStyles[variant])}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}