
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
  // Directly implement the status badge rendering without relying on ClientsTable
  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400 hover:bg-success-200 dark:hover:bg-success-900/50">Active</Badge>;
      case 'at-risk':
        return <Badge className="bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400 hover:bg-warning-200 dark:hover:bg-warning-900/50">At Risk</Badge>;
      case 'churned':
        return <Badge className="bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400 hover:bg-danger-200 dark:hover:bg-danger-900/50">Churned</Badge>;
      case 'new':
        return <Badge className="bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900/50">New</Badge>;
      default:
        return null;
    }
  };

  // Get the columns for the table
  const getColumns = () => {
    return [
      {
        key: 'select',
        header: (
          <div 
            className="flex items-center justify-center cursor-pointer" 
            onClick={() => onSelectAll()}
            role="checkbox"
            aria-checked={selectedClientIds.length === currentItems.length && currentItems.length > 0}
            tabIndex={0}
          >
            {selectedClientIds.length === currentItems.length && currentItems.length > 0 ? (
              <span className="h-4 w-4">✓</span>
            ) : (
              <span className="h-4 w-4">□</span>
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
            tabIndex={0}
          >
            {selectedClientIds.includes(client.id) ? (
              <span className="h-4 w-4">✓</span>
            ) : (
              <span className="h-4 w-4">□</span>
            )}
          </div>
        ),
        className: "w-[40px]"
      },
      {
        key: 'name',
        header: 'Client',
        cell: (client: Client) => <span className="font-medium">{client.name}</span>
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
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => onViewDetails(client)}
            >
              View
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => onEditMetrics(client)}
            >
              Edit
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => onUpdateNPS(client)}
            >
              NPS
            </button>
          </div>
        ),
        className: "text-right"
      }
    ];
  };

  return (
    <>
      {viewMode === 'table' ? (
        <>
          {/* Use VirtualizedTable for better performance with large datasets */}
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
        </>
      ) : (
        <ClientKanbanView 
          clients={currentItems} 
          onEditMetrics={onEditMetrics} 
          onUpdateNPS={onUpdateNPS} 
        />
      )}
    </>
  );
}
