
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Layers } from "lucide-react";

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedClientCount: number;
  onOpenBulkActions: () => void;
  placeholder?: string;
}

export function ClientSearchBar({
  searchQuery,
  onSearchChange,
  selectedClientCount,
  onOpenBulkActions,
  placeholder = "Search by client name or CSM..."
}: ClientSearchBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-9"
        />
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
