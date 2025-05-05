import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Client } from "@/lib/data";
import { ResponsiveTable } from "../Shared/ResponsiveTable";
import { ResponsiveGrid } from "../Shared/ResponsiveGrid";
import { ClientKanbanView } from "../ClientKanbanView";
import { Badge } from "@/components/ui/badge";
import { VirtualizedClientList } from "./VirtualizedClientList";

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
  indexOfLastItem
}: ClientListContentProps) {
  const getStatusBadge = (status: Client['status']) => {
    const colorMap = {
      'active': "badge-success",
      'at-risk': "badge-warning",
      'churned': "badge-danger",
      'new': "badge-info"
    };

    return (
      <Badge 
        className={colorMap[status] || ""}
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
            onClick={() => onViewDetails(client)}
            aria-label={`View details for ${client.name}`}
          >
            View
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
            onClick={() => onEditMetrics(client)}
            aria-label={`Edit metrics for ${client.name}`}
          >
            Edit
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
            onClick={() => onUpdateNPS(client)}
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
        />
      ) : (
        <ResponsiveGrid
          cols={{ xs: 1, sm: 2, md: 2, lg: 3 }}
          gap="lg"
          className="w-full"
          role="region"
          aria-label="Client kanban board"
        >
          <ClientKanbanView 
            clients={currentItems} 
            onEditMetrics={onEditMetrics} 
            onUpdateNPS={onUpdateNPS} 
          />
        </ResponsiveGrid>
      )}
    </div>
  );
}
