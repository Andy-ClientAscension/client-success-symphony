
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define status options
const STATUS_OPTIONS = {
  "all": "All Statuses",
  "active": "Active",
  "at-risk": "At Risk", 
  "new": "New",
  "churned": "Churned"
};

interface ClientsHeaderProps {
  clientCount: number;
  onAddNewClient: () => void;
  searchQuery?: string;
  statusFilter?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusFilterChange?: (value: string) => void;
}

export function ClientsHeader({ 
  clientCount, 
  onAddNewClient, 
  searchQuery = "", 
  statusFilter = "all",
  onSearchChange,
  onStatusFilterChange 
}: ClientsHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-lg font-bold">Clients Management ({clientCount})</div>
        <Button 
          onClick={onAddNewClient}
          className="bg-red-600 hover:bg-red-700 px-6 py-2.5 text-base"
          size="lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
        </Button>
      </div>
      
      {/* Advanced filtering controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input 
            placeholder="Search clients..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
