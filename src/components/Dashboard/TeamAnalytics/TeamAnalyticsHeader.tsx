
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { FilterBar } from "../Shared/FilterBar";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeamAnalyticsHeaderProps {
  title?: string; // Making title optional
  selectedTeam: string;
  teams: string[];
  onTeamChange: (team: string) => void;
  onAddTeam: () => void;
  onDeleteTeam: () => void;
}

export function TeamAnalyticsHeader({
  title = "Team Analytics", // Setting a default value
  selectedTeam,
  teams,
  onTeamChange,
  onAddTeam,
  onDeleteTeam
}: TeamAnalyticsHeaderProps) {
  const { isMobile } = useIsMobile();
  
  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={onAddTeam}
            className="h-8 w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Team
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={onDeleteTeam}
            className="h-8 w-full sm:w-auto" 
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete Team
          </Button>
        </div>
      </div>
      
      <div className="w-full">
        <FilterBar
          selectedTeam={selectedTeam}
          teams={["all", ...teams]}
          onTeamChange={onTeamChange}
        />
      </div>
    </div>
  );
}
