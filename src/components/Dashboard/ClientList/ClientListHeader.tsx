
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutList, Kanban } from "lucide-react";
import { ClientListFilters } from "../ClientListFilters";

interface ClientListHeaderProps {
  filteredClientCount: number;
  selectedTeam: string;
  searchQuery: string;
  viewMode: 'table' | 'kanban';
  itemsPerPage: number;
  onTeamChange: (value: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewModeChange: (value: 'table' | 'kanban') => void;
  onAddNewClient: () => void;
  onItemsPerPageChange: (value: number) => void;
}

export function ClientListHeader({
  filteredClientCount,
  selectedTeam,
  searchQuery,
  viewMode,
  itemsPerPage,
  onTeamChange,
  onSearchChange,
  onViewModeChange,
  onAddNewClient,
  onItemsPerPageChange
}: ClientListHeaderProps) {
  return (
    <>
      <CardTitle>
        Client Overview 
        <span className="text-muted-foreground text-sm ml-2">
          (Total: {filteredClientCount})
        </span>
      </CardTitle>
      <div className="flex items-center gap-4">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && onViewModeChange(value as 'table' | 'kanban')}
        >
          <ToggleGroupItem value="table" aria-label="List view">
            <LayoutList className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban view">
            <Kanban className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ClientListFilters 
          selectedTeam={selectedTeam}
          searchQuery={searchQuery}
          onTeamChange={onTeamChange}
          onSearchChange={onSearchChange}
          filteredClients={[]} // This is not actually used in the component
          onAddNewClient={onAddNewClient}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </>
  );
}
