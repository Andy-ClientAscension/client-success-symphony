
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface AvatarSkeletonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export function AvatarSkeleton({
  size = 'md',
  withText = false,
  className
}: AvatarSkeletonProps) {
  const sizeMap = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeMap = {
    xs: 'h-2 w-12',
    sm: 'h-3 w-16',
    md: 'h-3 w-20',
    lg: 'h-4 w-24',
    xl: 'h-4 w-32'
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Skeleton className={`rounded-full ${sizeMap[size]}`} />
      {withText && (
        <div className="space-y-1">
          <Skeleton className={textSizeMap[size]} />
          <Skeleton className="h-2 w-16" />
        </div>
      )}
    </div>
  );
}
