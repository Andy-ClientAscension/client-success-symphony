
import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Client } from "@/lib/data";
import { VirtualizedClientRow } from "./VirtualizedClientRow";

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
}

export function VirtualizedClientList({
  clients,
  columns,
  selectedClientIds,
  onSelectClient,
  onViewDetails,
  onEditMetrics,
  onUpdateNPS,
  paginationProps
}: VirtualizedClientListProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: clients.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5, // Number of items to render before and after the visible area
  });

  // Pagination controls
  const renderPagination = () => {
    const { currentPage, totalPages, onPageChange, startIndex, endIndex, totalItems } = paginationProps;
    
    return (
      <div className="flex items-center justify-between py-4 px-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of{" "}
            <span className="font-medium">{totalItems}</span> clients
          </p>
        </div>
        <div className="flex gap-1">
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
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
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
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
        <div 
          ref={tableContainerRef} 
          className="overflow-auto" 
          style={{ height: '600px' }}
        >
          <table className="min-w-full">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <VirtualizedClientRow
                  key={clients[virtualRow.index].id}
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
                />
              ))}
            </tbody>
          </table>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} />
        </div>
      </div>
      {renderPagination()}
    </div>
  );
}
