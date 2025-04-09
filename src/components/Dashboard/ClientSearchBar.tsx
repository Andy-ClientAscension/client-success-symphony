
import { Search, Loader, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Layers, KeySquare } from "lucide-react";
import { useState, useEffect } from "react";

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedClientCount: number;
  onOpenBulkActions: () => void;
  placeholder?: string;
  isSearching?: boolean;
}

export function ClientSearchBar({
  searchQuery,
  onSearchChange,
  selectedClientCount,
  onOpenBulkActions,
  placeholder = "Search by client name or CSM...",
  isSearching = false
}: ClientSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isShortcutVisible, setIsShortcutVisible] = useState(false);

  // Show keyboard shortcut hint after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShortcutVisible(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      <div className="relative flex-grow">
        {isSearching ? (
          <Loader className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-9 pr-8 h-10 bg-white dark:bg-gray-800 ${isFocused ? 'ring-1 ring-ring shadow-sm' : 'shadow-sm'}`}
          aria-label="Search clients"
        />
        {searchQuery ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
            aria-label="Clear search"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        ) : isShortcutVisible ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <KeySquare className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
            <span className="text-xs text-muted-foreground opacity-70">Ctrl+K</span>
          </div>
        ) : null}
      </div>
      
      {selectedClientCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {selectedClientCount} selected
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenBulkActions}
            className="flex items-center bg-white dark:bg-gray-800 shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Bulk Actions
          </Button>
        </div>
      )}
    </div>
  );
}
