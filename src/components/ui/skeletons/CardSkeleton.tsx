
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CardSkeletonProps {
  hasHeader?: boolean;
  headerHeight?: number;
  contentCount?: number;
  aspectRatio?: 'auto' | 'square' | 'video';
  className?: string;
}

export function CardSkeleton({ 
  hasHeader = true, 
  headerHeight = 5,
  contentCount = 3,
  aspectRatio = 'auto',
  className
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader>
          <Skeleton className={`h-${headerHeight} w-1/2`} />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {aspectRatio !== 'auto' && (
          <div className={`aspect-${aspectRatio} w-full`}>
            <Skeleton className="h-full w-full" />
          </div>
        )}
        {Array.from({ length: contentCount }).map((_, index) => (
          <Skeleton 
            key={index} 
            className={`h-4 w-${index === contentCount - 1 ? '3/4' : 'full'}`} 
          />
        ))}
      </CardContent>
    </Card>
  );
}
