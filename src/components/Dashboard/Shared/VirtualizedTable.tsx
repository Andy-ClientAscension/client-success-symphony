
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
import { Pagination } from "../Pagination";
import { useVirtual } from "@tanstack/react-virtual";

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
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
  };
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
  itemHeight = 48, // Default row height
  pagination
}: VirtualizedTableProps<T>) {
  const { isMobile } = useIsMobile();
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const [tableHeight, setTableHeight] = useState(400); // Default height
  
  // Determine visible columns based on mobile status
  const visibleColumns = React.useMemo(() => {
    return isMobile 
      ? columns.filter(col => !col.hideOnMobile) 
      : columns;
  }, [columns, isMobile]);

  // Adjust table height based on container size
  useEffect(() => {
    if (!tableBodyRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Limit table height to prevent excessive rendering
        const maxHeight = Math.min(entry.contentRect.height, 600);
        setTableHeight(maxHeight > 0 ? maxHeight : 400);
      }
    });
    
    resizeObserver.observe(tableBodyRef.current.parentElement as HTMLElement);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Set up virtualization
  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef: tableBodyRef,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan: 10,
  });

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
              rowVirtualizer.virtualItems.map(virtualRow => {
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
