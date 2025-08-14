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
  iconColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className,
  variant = 'default',
  style,
  iconColor = 'bg-gray-100 text-gray-600'
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
    <Card className={cn(
      'bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow',
      variantStyles[variant],
      className
    )} style={style}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
              iconBgStyles[variant],
              iconColorStyles[variant]
            )}>
              <div className="h-6 w-6">
                {icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
            <p className="text-2xl font-bold text-foreground mb-2">{value}</p>
            {trend && (
              <div className={cn(
                'flex items-center text-sm',
                getTrendColor()
              )}>
                {getTrendIcon()}
                <span className="font-medium ml-1">{trend.value}% {trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}