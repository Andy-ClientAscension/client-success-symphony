
import { useClientTable } from './ClientTableContext';
import { TableRow, TableHead, TableHeader as ShadcnTableHeader } from '@/components/ui/table';
import { CheckSquare, Square } from 'lucide-react';
import { focusRingClasses } from '@/lib/accessibility';

export function TableHeader() {
  const { clients, selectedClientIds, onSelectAll } = useClientTable();
  const allSelected = selectedClientIds.length === clients.length && clients.length > 0;

  return (
    <ShadcnTableHeader>
      <TableRow>
        <TableHead className="w-[40px]">
          <div 
            className={`flex items-center justify-center cursor-pointer ${focusRingClasses}`} 
            onClick={onSelectAll}
            role="checkbox"
            aria-checked={allSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectAll();
              }
            }}
          >
            <span className="sr-only">{allSelected ? 'Unselect all clients' : 'Select all clients'}</span>
            {allSelected ? (
              <CheckSquare className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Square className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
        </TableHead>
        <TableHead>Client</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Progress</TableHead>
        <TableHead>End Date</TableHead>
        <TableHead>CSM</TableHead>
        <TableHead>Calls Booked</TableHead>
        <TableHead>Deals Closed</TableHead>
        <TableHead>MRR</TableHead>
        <TableHead>NPS</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </ShadcnTableHeader>
  );
}
