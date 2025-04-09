
import { Search, Loader, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Layers, KeySquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Show keyboard shortcut hint after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isMobile) {
        setIsShortcutVisible(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isMobile]);

  const handleClear = () => {
    onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-wrap"} gap-3 mb-5`}>
      <div className="relative flex-grow">
        {isSearching ? (
          <Loader 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" 
            aria-hidden="true"
          />
        ) : (
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
            aria-hidden="true"
          />
        )}
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-9 pr-8 ${isMobile ? "h-11" : "h-10"} bg-white dark:bg-gray-800 ${isFocused ? 'ring-1 ring-ring shadow-sm' : 'shadow-sm'}`}
          aria-label="Search clients"
          id="client-search"
        />
        {searchQuery ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute right-1 top-1/2 -translate-y-1/2 ${isMobile ? "h-9 w-9" : "h-8 w-8"}`}
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : isShortcutVisible ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <KeySquare className="h-3.5 w-3.5 text-muted-foreground opacity-70" aria-hidden="true" />
            <span className="text-xs text-muted-foreground opacity-70">Ctrl+K</span>
          </div>
        ) : null}
      </div>
      
      {selectedClientCount > 0 && (
        <div className={`flex items-center ${isMobile ? "justify-center w-full" : "gap-2"}`}>
          <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md mr-2">
            {selectedClientCount} selected
          </span>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"} 
            onClick={onOpenBulkActions}
            className={`flex items-center bg-white dark:bg-gray-800 shadow-sm ${isMobile ? "flex-1 py-2" : ""}`}
            aria-label={`Perform bulk actions on ${selectedClientCount} selected clients`}
            title="Open bulk actions menu"
          >
            <Layers className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Bulk Actions
          </Button>
        </div>
      )}
    </div>
  );
}
