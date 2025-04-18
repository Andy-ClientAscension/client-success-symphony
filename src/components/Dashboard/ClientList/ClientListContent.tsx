
import React from "react";
import { Client } from "@/lib/data";
import { ClientsTable } from "../ClientsTable";
import { Pagination } from "../Pagination";
import { ClientKanbanView } from "../ClientKanbanView";
import { VirtualizedTable } from "../Shared/VirtualizedTable";
import { Badge } from "@/components/ui/badge";

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
      'active': "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50",
      'at-risk': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50",
      'churned': "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50",
      'new': "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
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
        <div className="flex items-center gap-2">
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
    <div role="region" aria-label="Client List">
      {viewMode === 'table' ? (
        <VirtualizedTable
          data={currentItems}
          columns={getColumns()}
          keyExtractor={(client: Client) => client.id}
          emptyMessage="No clients found matching your filters."
          className="border rounded-lg mb-4"
          stripedRows={true}
          itemHeight={56}
          pagination={{
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
        <ClientKanbanView 
          clients={currentItems} 
          onEditMetrics={onEditMetrics} 
          onUpdateNPS={onUpdateNPS} 
        />
      )}
    </div>
  );
}
