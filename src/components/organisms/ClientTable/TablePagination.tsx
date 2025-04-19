
import { useClientTable } from './ClientTableContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { focusRingClasses } from '@/lib/accessibility';

export function TablePagination() {
  const { currentPage, totalPages, onPageChange, itemsPerPage, clients } = useClientTable();
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, clients.length);
  const totalItems = clients.length;

  return (
    <div 
      className="flex items-center justify-between space-x-2 py-4 px-6 border-t"
      role="navigation"
      aria-label="Pagination"
    >
      <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {totalItems > 0 
          ? `Showing ${startItem} to ${endItem} of ${totalItems} clients` 
          : 'No clients found'}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className={focusRingClasses}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
          <span>Previous</span>
        </Button>
        <div 
          className="flex items-center gap-1 text-sm" 
          aria-current="page"
          aria-label={`Page ${currentPage} of ${totalPages}`}
        >
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          className={focusRingClasses}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
