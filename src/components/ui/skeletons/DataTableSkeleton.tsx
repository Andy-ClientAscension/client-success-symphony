
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  hasHeader?: boolean;
  hasFilters?: boolean;
  hasFooter?: boolean;
  title?: string;
}

export function DataTableSkeleton({
  columnCount = 4,
  rowCount = 5,
  hasHeader = true,
  hasFilters = true,
  hasFooter = true,
  title = 'Loading data...'
}: DataTableSkeletonProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        {hasHeader && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              <Skeleton className="h-7 w-48" />
            </CardTitle>
            <div className="mt-2 sm:mt-0 flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        )}
        
        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-8 w-[160px]" />
            <div className="ml-auto">
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="mt-4 rounded-md border">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2">
            {/* Checkbox column */}
            <div className="col-span-1 flex items-center justify-center">
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            
            {/* Header columns */}
            {Array.from({ length: columnCount - 1 }).map((_, i) => (
              <div
                key={`header-${i}`}
                className={`col-span-${Math.floor(11 / (columnCount - 1))} px-2`}
              >
                <Skeleton className="h-4 w-full max-w-[100px]" />
              </div>
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="grid grid-cols-12 gap-2 border-b p-2 last:border-none"
              role="row"
              aria-rowindex={rowIdx + 1}
            >
              {/* Checkbox column */}
              <div className="col-span-1 flex items-center justify-center">
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              
              {/* Data columns */}
              {Array.from({ length: columnCount - 1 }).map((_, colIdx) => (
                <div
                  key={`cell-${rowIdx}-${colIdx}`}
                  className={`col-span-${Math.floor(11 / (columnCount - 1))} px-2`}
                  role="cell"
                  aria-colindex={colIdx + 1}
                >
                  {colIdx === 0 ? (
                    <Skeleton className="h-5 w-full max-w-[180px]" />
                  ) : colIdx === columnCount - 2 ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-full max-w-[100px]" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ) : (
                    <Skeleton className="h-5 w-full max-w-[120px]" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {hasFooter && (
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-5 w-[200px]" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
