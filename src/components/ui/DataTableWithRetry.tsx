
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableSkeleton } from "@/components/ui/skeletons/DataTableSkeleton";
import { ErrorWithRetry } from "@/components/ui/skeletons/ErrorWithRetry";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DataTableWithRetryProps<T> {
  data: T[] | null;
  columns: {
    id: string;
    header: React.ReactNode;
    cell: (item: T) => React.ReactNode;
  }[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  isRetrying?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function DataTableWithRetry<T>({
  data,
  columns,
  isLoading,
  error,
  onRetry,
  isRetrying = false,
  title,
  emptyMessage = "No data available",
  className
}: DataTableWithRetryProps<T>) {
  if (isLoading) {
    return (
      <DataTableSkeleton 
        rowCount={5} 
        columnCount={columns.length}
        hasHeader={!!title} // Changed showHeader to hasHeader
        className={className}
      />
    );
  }

  if (error) {
    return (
      <ErrorWithRetry
        error={error}
        onRetry={onRetry}
        isRetrying={isRetrying}
        title={`Error Loading ${title || 'Data'}`}
        className={className}
      />
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying || isLoading}
            >
              {(isRetrying || isLoading) ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1 sr-only">Refresh</span>
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead key={column.id}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map(column => (
                    <TableCell key={`${rowIndex}-${column.id}`}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
