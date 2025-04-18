import React, { useRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "../Pagination";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ValidationError } from "@/components/ValidationError";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  stripedRows?: boolean;
  roundedBorders?: boolean;
  hoverable?: boolean;
  itemHeight?: number;
  isLoading?: boolean;
  error?: Error | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
  };
  onRetry?: () => void;
}

export function VirtualizedTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
  className,
  stripedRows = false,
  roundedBorders = false,
  hoverable = true,
  itemHeight = 48,
  isLoading = false,
  error = null,
  pagination,
  onRetry
}: VirtualizedTableProps<T>) {
  const { isMobile } = useIsMobile();
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const [tableHeight, setTableHeight] = useState(400);
  const [scrollPositionRestored, setScrollPositionRestored] = useState(false);
  
  const scrollPositionRef = useRef(0);

  const visibleColumns = React.useMemo(() => {
    return isMobile 
      ? columns.filter(col => !col.hideOnMobile) 
      : columns;
  }, [columns, isMobile]);

  useEffect(() => {
    if (!tableBodyRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const viewportHeight = window.innerHeight;
        const maxHeight = Math.min(
          Math.max(entry.contentRect.height, 300),
          viewportHeight * 0.7
        );
        setTableHeight(maxHeight > 0 ? maxHeight : 400);
      }
    });
    
    const container = tableBodyRef.current.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!tableBodyRef.current) return;
    
    const handleScroll = () => {
      if (tableBodyRef.current) {
        scrollPositionRef.current = tableBodyRef.current.scrollTop;
      }
    };
    
    const tableBody = tableBodyRef.current;
    tableBody.addEventListener('scroll', handleScroll);
    
    return () => {
      tableBody.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    if (!tableBodyRef.current || scrollPositionRestored) return;
    
    requestAnimationFrame(() => {
      if (tableBodyRef.current) {
        tableBodyRef.current.scrollTop = scrollPositionRef.current;
        setScrollPositionRestored(true);
      }
    });
  }, [data, pagination, scrollPositionRestored]);
  
  useEffect(() => {
    if (pagination) {
      setScrollPositionRestored(false);
    }
  }, [pagination?.currentPage]);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableBodyRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan: 10,
  });

  if (isLoading) {
    return (
      <div className={cn("min-h-[300px]", className)}>
        <LoadingState message="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("min-h-[300px]", className)}>
        <ValidationError
          type="error"
          message={error.message}
          title="Error Loading Data"
        />
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className={cn("min-h-[300px]", className)}>
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "overflow-x-auto relative",
          roundedBorders ? "rounded-md border" : ""
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody 
            ref={tableBodyRef}
            className="relative"
            style={{
              height: `${data.length === 0 ? itemHeight : tableHeight}px`,
            }}
          >
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length} 
                  className="text-center py-10 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rowVirtualizer.getVirtualItems().map(virtualRow => {
                const item = data[virtualRow.index];
                return (
                  <TableRow 
                    key={keyExtractor(item)}
                    className={cn(
                      "absolute w-full",
                      stripedRows && virtualRow.index % 2 !== 0 ? "bg-muted/30 dark:bg-gray-800/30" : "",
                      hoverable ? "hover:bg-muted/50 dark:hover:bg-gray-800/50" : ""
                    )}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    data-index={virtualRow.index}
                  >
                    {visibleColumns.map((column) => (
                      <TableCell 
                        key={`${keyExtractor(item)}-${column.key}`}
                        className={column.className}
                      >
                        {column.cell(item, virtualRow.index)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
        />
      )}
    </div>
  );
}
