
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Trash2 } from "lucide-react";

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedClientCount: number;
  onOpenBulkActions: () => void;
  onDelete?: () => void;
}

export function ClientSearchBar({
  searchQuery,
  onSearchChange,
  selectedClientCount,
  onOpenBulkActions,
  onDelete
}: ClientSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-8 bg-white dark:bg-gray-800 focus-visible:ring-red-600"
        />
      </div>
      
      {selectedClientCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenBulkActions}
            className="border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Users className="mr-2 h-4 w-4" />
            Bulk Actions ({selectedClientCount})
          </Button>
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              className="border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedClientCount})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
