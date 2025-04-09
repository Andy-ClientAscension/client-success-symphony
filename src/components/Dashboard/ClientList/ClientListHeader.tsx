
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutList, Kanban } from "lucide-react";
import { ClientListFilters } from "../ClientListFilters";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  if (isMobile) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-lg">
            Client Overview 
            <span className="text-muted-foreground text-sm ml-2">
              (Total: {filteredClientCount})
            </span>
          </CardTitle>
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && onViewModeChange(value as 'table' | 'kanban')}
            className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md"
          >
            <ToggleGroupItem value="table" aria-label="List view" className="h-9 w-9 data-[state=on]:bg-white dark:data-[state=on]:bg-gray-700">
              <LayoutList className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban view" className="h-9 w-9 data-[state=on]:bg-white dark:data-[state=on]:bg-gray-700">
              <Kanban className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full flex justify-between items-center mb-2">
              <span>Filters and Options</span>
              {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
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
          </CollapsibleContent>
        </Collapsible>
      </>
    );
  }

  return (
    <>
      <CardTitle className="text-lg mb-4">
        Client Overview 
        <span className="text-muted-foreground text-sm ml-2">
          (Total: {filteredClientCount})
        </span>
      </CardTitle>
      <div className="flex items-center gap-4 mb-4">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && onViewModeChange(value as 'table' | 'kanban')}
          className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md"
        >
          <ToggleGroupItem value="table" aria-label="List view" className="h-8 data-[state=on]:bg-white dark:data-[state=on]:bg-gray-700">
            <LayoutList className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban view" className="h-8 data-[state=on]:bg-white dark:data-[state=on]:bg-gray-700">
            <Kanban className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Separator orientation="vertical" className="h-8" />
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
