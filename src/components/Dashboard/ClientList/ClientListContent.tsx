
import React from "react";
import { Client } from "@/lib/data";
import { ClientsTable } from "../ClientsTable";
import { Pagination } from "../Pagination";
import { ClientKanbanView } from "../ClientKanbanView";
import { VirtualizedTable } from "../Shared/VirtualizedTable";

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
  // Get the columns from ClientsTable
  const getColumns = () => {
    const getStatusBadge = (status: Client['status']) => {
      const table = new ClientsTable({
        clients: [],
        selectedClientIds: [],
        onSelectClient: () => {},
        onSelectAll: () => {},
        onViewDetails: () => {},
        onEditMetrics: () => {},
        onUpdateNPS: () => {}
      });
      // @ts-ignore - This is a hack to get access to the private method
      return table.getStatusBadge(status);
    };

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
