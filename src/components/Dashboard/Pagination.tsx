
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const renderPageButtons = () => {
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
          className={`h-8 w-8 p-0 ${pageNumber === currentPage ? 'bg-red-600 hover:bg-red-700' : ''}`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      );
    }
    
    return buttons;
  };
  
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-xs text-muted-foreground">
        Showing {startIndex + 1}-{endIndex} of {totalItems} items
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {renderPageButtons()}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
