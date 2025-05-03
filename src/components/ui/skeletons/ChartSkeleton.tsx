
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  height?: number | string;
  showLegend?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function ChartSkeleton({ 
  height = 200, 
  showLegend = true, 
  showHeader = true,
  className = ""
}: ChartSkeletonProps) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          {showLegend && (
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`legend-${i}`} className="h-4 w-12" />
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="relative" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {/* Chart background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`grid-${i}`} className="h-px w-full bg-gray-100 opacity-30" />
          ))}
        </div>
        
        {/* Chart "bars" or "lines" */}
        <div className="absolute inset-0 flex items-end justify-between pt-4 pb-1 px-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={`bar-${i}`} 
              className="w-6 rounded-sm" 
              style={{ 
                height: `${15 + Math.random() * 65}%`,
                opacity: 0.7 + (Math.random() * 0.3)
              }} 
            />
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={`label-${i}`} className="h-3 w-6" />
          ))}
        </div>
      </div>
    </div>
  );
}
