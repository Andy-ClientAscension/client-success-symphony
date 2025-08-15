
import React from "react";
import { Client } from "@/lib/data";
import { ResponsiveGrid } from "../Shared/ResponsiveGrid";
import { ClientKanbanView } from "../ClientKanbanView";
import { Badge } from "@/components/ui/badge";
import { VirtualizedClientList } from "./VirtualizedClientList";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientListContentProps {
  viewMode: 'table' | 'kanban';
  currentItems: Client[];
  selectedClientIds: string[];
  onSelectClient: (clientId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  isLoading?: boolean;
}

export function ClientListContent({
  viewMode,
  currentItems,
  selectedClientIds,
  onSelectClient,
  onSelectAll,
  onViewDetails,
  onEditMetrics,
  onUpdateNPS,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  indexOfFirstItem,
  indexOfLastItem,
  isLoading = false
}: ClientListContentProps) {
  const getStatusBadge = (status: Client['status']) => {
    const getStatusColorClass = (status: string) => {
      switch (status) {
        case 'new': return 'bg-client-new text-white border-0';
        case 'active': return 'bg-client-active text-white border-0';
        case 'caution': return 'bg-client-caution text-white border-0';
        case 'at-risk': return 'bg-client-caution text-white border-0';
        case 'not-active': return 'bg-client-not-active text-white border-0';
        case 'churned': return 'bg-client-not-active text-white border-0';
        default: return 'bg-muted text-muted-foreground border-0';
      }
    };

    return (
      <Badge 
        className={`${getStatusColorClass(status)} capitalize`}
        role="status"
        aria-label={`Client status: ${status}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getColumns = () => [
    {
      key: 'select',
      header: (
        <div 
          className="flex items-center justify-center cursor-pointer" 
          onClick={() => onSelectAll()}
          role="checkbox"
          aria-checked={selectedClientIds.length === currentItems.length && currentItems.length > 0}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectAll();
            }
          }}
        >
          <span className="sr-only">Select all clients</span>
          {selectedClientIds.length === currentItems.length && currentItems.length > 0 ? (
            <span className="h-4 w-4" aria-hidden="true">✓</span>
          ) : (
            <span className="h-4 w-4" aria-hidden="true">□</span>
          )}
        </div>
      ),
      cell: (client: Client) => (
        <div 
          className="flex items-center justify-center cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onSelectClient(client.id);
          }}
          role="checkbox"
          aria-checked={selectedClientIds.includes(client.id)}
          aria-label={`Select ${client.name}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onSelectClient(client.id);
            }
          }}
        >
          {selectedClientIds.includes(client.id) ? (
            <span className="h-4 w-4" aria-hidden="true">✓</span>
          ) : (
            <span className="h-4 w-4" aria-hidden="true">□</span>
          )}
        </div>
      ),
      className: "w-[40px]"
    },
    {
      key: 'name',
      header: 'Client',
      cell: (client: Client) => (
        <span className="font-medium" role="cell">
          {client.name}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (client: Client) => getStatusBadge(client.status)
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (client: Client) => (
        <div 
          className="flex items-center gap-2"
          role="group"
          aria-label={`Actions for ${client.name}`}
        >
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(client);
            }}
            aria-label={`View details for ${client.name}`}
          >
            View
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onEditMetrics(client);
            }}
            aria-label={`Edit metrics for ${client.name}`}
          >
            Edit
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateNPS(client);
            }}
            aria-label={`Update NPS for ${client.name}`}
          >
            NPS
          </button>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <div 
      role="region" 
      aria-label="Client List"
      data-testid="client-list-content"
    >
      {viewMode === 'table' ? (
        <VirtualizedClientList
          clients={currentItems}
          columns={getColumns()}
          selectedClientIds={selectedClientIds}
          onSelectClient={onSelectClient}
          onViewDetails={onViewDetails}
          onEditMetrics={onEditMetrics}
          onUpdateNPS={onUpdateNPS}
          paginationProps={{
            currentPage,
            totalPages,
            onPageChange,
            totalItems,
            itemsPerPage,
            startIndex: indexOfFirstItem,
            endIndex: indexOfLastItem
          }}
          isLoading={isLoading}
        />
      ) : (
        <ResponsiveGrid
          cols={{ xs: 1, sm: 2, md: 2, lg: 3 }}
          gap="lg"
          className="w-full"
          role="region"
          aria-label="Client kanban board"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="p-4 border rounded-md">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          ) : (
            <ClientKanbanView 
              clients={currentItems} 
              onEditMetrics={onEditMetrics} 
              onUpdateNPS={onUpdateNPS} 
            />
          )}
        </ResponsiveGrid>
      )}
    </div>
  );
}
