
import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Client } from "@/lib/data";
import { VirtualizedClientRow } from "./VirtualizedClientRow";
import { Skeleton } from "@/components/ui/skeleton";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

interface VirtualizedClientListProps {
  clients: Client[];
  columns: any[];
  selectedClientIds: string[];
  onSelectClient: (clientId: string) => void;
  onViewDetails: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
  paginationProps: PaginationProps;
  isLoading?: boolean;
}

export function VirtualizedClientList({
  clients,
  columns,
  selectedClientIds,
  onSelectClient,
  onViewDetails,
  onEditMetrics,
  onUpdateNPS,
  paginationProps,
  isLoading = false
}: VirtualizedClientListProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 5 : clients.length || 0,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5, // Number of items to render before and after the visible area
  });

  // If we have no clients and are not loading, show empty state
  if (!isLoading && (!clients || clients.length === 0)) {
    return (
      <div className="border rounded-lg mb-4 p-6 text-center">
        <p className="text-muted-foreground">No clients found</p>
      </div>
    );
  }

  // Handler for row clicks
  const handleRowClick = (client: Client) => {
    onViewDetails(client);
  };

  // Pagination controls
  const renderPagination = () => {
    const { currentPage, totalPages, onPageChange, startIndex, endIndex, totalItems } = paginationProps;
    
    return (
      <div className="flex items-center justify-between py-4 px-2">
        <div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="w-40 h-4" />
            ) : (
              <>
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{totalItems}</span> clients
              </>
            )}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show a subset of pages around current page
              let pageNum = currentPage;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    className={`w-8 h-8 flex items-center justify-center rounded ${
                      pageNum === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Skeleton className="w-4 h-4" /> : pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-muted z-10 border-b">
          <div className="grid grid-cols-[40px_1fr_120px_200px] gap-4 py-3 px-4">
            {columns.map((column) => (
              <div
                key={column.key}
                className={`text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </div>
            ))}
          </div>
        </div>
        
        {/* Virtualized Content Container */}
        <div 
          ref={tableContainerRef} 
          className="overflow-auto relative" 
          style={{ height: '500px' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {isLoading ? (
              // Loading state
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="grid grid-cols-[40px_1fr_120px_200px] gap-4 py-3 px-4 animate-pulse border-b">
                    {columns.map((column) => (
                      <div key={`skeleton-${idx}-${column.key}`}>
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              // Virtualized rows
              rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <VirtualizedClientRow
                  key={clients[virtualRow.index]?.id || `virtual-row-${virtualRow.index}`}
                  client={clients[virtualRow.index]}
                  columns={columns}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={handleRowClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
      {renderPagination()}
    </div>
  );
}
