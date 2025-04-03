
import React from "react";
import { Client } from "@/lib/data";
import { ClientsTable } from "../ClientsTable";
import { Pagination } from "../Pagination";
import { ClientKanbanView } from "../ClientKanbanView";

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
  return (
    <>
      {viewMode === 'table' ? (
        <>
          <ClientsTable 
            clients={currentItems}
            selectedClientIds={selectedClientIds}
            onSelectClient={onSelectClient}
            onSelectAll={onSelectAll}
            onViewDetails={onViewDetails}
            onEditMetrics={onEditMetrics}
            onUpdateNPS={onUpdateNPS}
          />
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            startIndex={indexOfFirstItem}
            endIndex={Math.min(indexOfLastItem, totalItems)}
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
