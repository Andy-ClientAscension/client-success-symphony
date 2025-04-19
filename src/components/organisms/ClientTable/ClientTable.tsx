
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableBody } from '@/components/ui/table';
import { Client } from '@/lib/data';
import { ClientTableProvider } from './ClientTableContext';
import { TableHeader } from './TableHeader';
import { ClientRow } from './ClientRow';
import { TablePagination } from './TablePagination';
import { reducedMotionConfig } from '@/lib/accessibility';

interface ClientTableProps {
  clients: Client[];
  selectedClientIds: string[];
  onSelectClient: (clientId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function ClientTable({
  clients,
  selectedClientIds,
  onSelectClient,
  onSelectAll,
  onViewDetails,
  onEditMetrics,
  onUpdateNPS,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
}: ClientTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: clients.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const contextValue = {
    clients,
    selectedClientIds,
    onSelectClient,
    onSelectAll,
    onViewDetails,
    onEditMetrics,
    onUpdateNPS,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
  };

  return (
    <ClientTableProvider value={contextValue}>
      <div 
        className="rounded-md border"
        role="region"
        aria-label="Client data table"
      >
        <div 
          ref={tableRef} 
          className="relative overflow-auto" 
          style={{ height: '600px' }}
          tabIndex={0}
          aria-label="Scrollable client table content"
        >
          <Table 
            role="grid" 
            aria-rowcount={clients.length + 1} // +1 for header row
            aria-colcount={11}
          >
            <TableHeader />
            <TableBody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <ClientRow
                  key={clients[virtualRow.index].id}
                  client={clients[virtualRow.index]}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    transition: reducedMotionConfig.duration()
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination />
      </div>
    </ClientTableProvider>
  );
}
