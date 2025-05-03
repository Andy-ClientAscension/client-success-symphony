
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "./TableSkeleton";

interface DataTableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function DataTableSkeleton({
  rowCount = 5,
  columnCount = 5,
  showFilters = true,
  showPagination = true,
  showHeader = true,
  className = ""
}: DataTableSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            
            {showFilters && (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-8 w-24" />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <TableSkeleton 
          rows={rowCount} 
          columns={columnCount}
          showHeader={true} 
        />
        
        {showPagination && (
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`page-${i}`} className="h-8 w-8" />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
