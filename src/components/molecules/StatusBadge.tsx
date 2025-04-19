
import React from 'react';
import { Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'at-risk' | 'churned' | 'new';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorMap = {
    'active': "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    'at-risk': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    'churned': "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    'new': "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  };

  return (
    <Badge 
      className={cn(colorMap[status], className)}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
