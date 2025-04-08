
import { Search, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Layers } from "lucide-react";
import { useState } from "react";

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

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-grow">
        {isSearching ? (
          <Loader className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-red-600" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-9 ${isFocused ? 'border-red-500 ring-1 ring-red-500' : ''}`}
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
          >
            <FileUp className="h-4 w-4 rotate-45" />
          </Button>
        )}
      </div>
      
      {selectedClientCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedClientCount} selected
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenBulkActions}
            className="flex items-center"
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Bulk Actions
          </Button>
        </div>
      )}
    </div>
  );
}
