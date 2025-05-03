
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";
import { focusRingClasses } from "@/lib/accessibility";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Memoize page buttons to avoid unnecessary re-renders
  const pageButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = Math.min(5, totalPages);
    
    let startPage = 1;
    if (totalPages > 5) {
      if (currentPage <= 3) {
        startPage = 1;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      } else {
        startPage = currentPage - 2;
      }
    }
    
    for (let i = 0; i < maxButtons; i++) {
      const pageNumber = startPage + i;
      if (pageNumber > totalPages) break;
      
      buttons.push(
        <Button
          key={pageNumber}
          variant={pageNumber === currentPage ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 p-0 ${pageNumber === currentPage ? 'bg-primary hover:bg-primary/90' : ''} ${focusRingClasses}`}
          onClick={() => {
            onPageChange(pageNumber);
            // Announce page change to screen readers
            const announcement = document.createElement('div');
            announcement.className = 'sr-only';
            announcement.setAttribute('aria-live', 'polite');
            announcement.innerText = `Page ${pageNumber} of ${totalPages}`;
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
          }}
          aria-current={pageNumber === currentPage ? "page" : undefined}
          aria-label={pageNumber === currentPage ? `Current Page, Page ${pageNumber}` : `Go to Page ${pageNumber}`}
        >
          {pageNumber}
        </Button>
      );
    }
    
    return buttons;
  }, [currentPage, totalPages, onPageChange]);
  
  // Calculate page jump options for very large datasets
  const pageJumpOptions = useMemo(() => {
    if (totalPages <= 10) return null;
    
    const options = [];
    const increment = Math.max(10, Math.floor(totalPages / 10));
    
    for (let i = 1; i <= totalPages; i += increment) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          Page {i}
        </SelectItem>
      );
    }
    
    // Always include the last page
    if ((totalPages % increment) !== 0) {
      options.push(
        <SelectItem key={totalPages} value={totalPages.toString()}>
          Page {totalPages}
        </SelectItem>
      );
    }
    
    return options;
  }, [totalPages]);
  
  return (
    <nav 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4"
      aria-label="Pagination navigation"
    >
      <div 
        className="text-xs text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {startIndex + 1}-{endIndex} of {totalItems} items
      </div>
      <div className="flex items-center gap-1" role="group" aria-label="Pagination controls">
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-8 w-8 p-0 ${focusRingClasses}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        {pageButtons}
        
        {pageJumpOptions && (
          <Select 
            value={currentPage.toString()} 
            onValueChange={(value) => onPageChange(parseInt(value))}
          >
            <SelectTrigger 
              className={`h-8 w-[70px] ml-1 ${focusRingClasses}`}
              aria-label="Jump to page"
            >
              <SelectValue placeholder="Jump" />
            </SelectTrigger>
            <SelectContent>
              {pageJumpOptions}
            </SelectContent>
          </Select>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-8 w-8 p-0 ${focusRingClasses}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </nav>
  );
}
