
import React from "react";
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

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  stripedRows?: boolean;
  roundedBorders?: boolean;
  hoverable?: boolean;
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

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
  className,
  stripedRows = false,
  roundedBorders = false,
  hoverable = true,
  pagination
}: ResponsiveTableProps<T>) {
  const { isMobile } = useIsMobile();
  
  const visibleColumns = React.useMemo(() => {
    return isMobile 
      ? columns.filter(col => !col.hideOnMobile) 
      : columns;
  }, [columns, isMobile]);

  return (
    <div 
      className={cn("w-full", className)}
      role="region"
      aria-label="Data Table"
    >
      <div className={cn(
        "overflow-x-auto",
        roundedBorders ? "rounded-md border" : ""
      )}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={column.className}
                  scope="col"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
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
              data.map((item, index) => (
                <TableRow 
                  key={keyExtractor(item)}
                  className={cn(
                    stripedRows && index % 2 !== 0 ? "bg-muted/30 dark:bg-gray-800/30" : "",
                    hoverable ? "hover:bg-muted/50 dark:hover:bg-gray-800/50" : ""
                  )}
                >
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={`${keyExtractor(item)}-${column.key}`}
                      className={column.className}
                    >
                      {column.cell(item, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
        <div className="mt-4" role="navigation" aria-label="Pagination">
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
          />
        </div>
      )}
    </div>
  );
}
