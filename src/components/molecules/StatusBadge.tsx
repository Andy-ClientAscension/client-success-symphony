
import React from 'react';
import { Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'at-risk' | 'churned' | 'new' | 'caution' | 'not-active';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorMap = {
    'new': "bg-[hsl(var(--client-new))] text-white",
    'active': "bg-[hsl(var(--client-active))] text-white", 
    'caution': "bg-[hsl(var(--client-caution))] text-white",
    'at-risk': "bg-[hsl(var(--client-caution))] text-white", // Map at-risk to caution
    'not-active': "bg-[hsl(var(--client-not-active))] text-white",
    'churned': "bg-[hsl(var(--client-not-active))] text-white" // Map churned to not-active
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
