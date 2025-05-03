
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CardSkeletonProps {
  hasHeader?: boolean;
  hasFooter?: boolean;
  contentRows?: number;
  className?: string;
}

export function CardSkeleton({ 
  hasHeader = true, 
  hasFooter = false, 
  contentRows = 3,
  className = ""
}: CardSkeletonProps) {
  return (
    <Card className={`w-full ${className}`}>
      {hasHeader && (
        <CardHeader className="pb-2">
          <CardTitle>
            <Skeleton className="h-6 w-2/3" />
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: contentRows }).map((_, i) => (
            <Skeleton 
              key={`content-${i}`} 
              className={`h-4 w-[${Math.max(40, Math.min(95, 90 - (i * 15)))}%]`} 
            />
          ))}
        </div>
      </CardContent>
      {hasFooter && (
        <div className="p-4 pt-0">
          <Skeleton className="h-8 w-28 mt-2" />
        </div>
      )}
    </Card>
  );
}
