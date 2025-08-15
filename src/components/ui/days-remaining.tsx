import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DaysRemainingProps {
  endDate: string;
  contractType?: string;
  className?: string;
  showIcon?: boolean;
}

export function DaysRemaining({ endDate, contractType, className, showIcon = true }: DaysRemainingProps) {
  const calculateDaysRemaining = (endDateStr: string): number => {
    const end = new Date(endDateStr);
    const today = new Date();
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysRemaining(endDate);

  const getVariant = (days: number) => {
    if (days <= 0) return 'destructive';
    if (days <= 7) return 'destructive';
    if (days <= 30) return 'secondary';
    if (days <= 90) return 'default';
    return 'outline';
  };

  const getIcon = (days: number) => {
    if (days <= 0) return <AlertTriangle className="h-3 w-3" />;
    if (days <= 7) return <AlertTriangle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getDisplayText = (days: number) => {
    if (days <= 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {contractType && (
        <Badge variant="outline" className="text-xs">
          {contractType}
        </Badge>
      )}
      <Badge variant={getVariant(daysLeft)} className="gap-1 text-xs">
        {showIcon && getIcon(daysLeft)}
        {getDisplayText(daysLeft)}
      </Badge>
    </div>
  );
}