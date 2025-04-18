
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { FilterBar } from "../Shared/FilterBar";

interface TeamAnalyticsHeaderProps {
  title: string;
  selectedTeam: string;
  teams: string[];
  onTeamChange: (team: string) => void;
  onAddTeam: () => void;
  onDeleteTeam: () => void;
}

export function TeamAnalyticsHeader({
  title,
  selectedTeam,
  teams,
  onTeamChange,
  onAddTeam,
  onDeleteTeam
}: TeamAnalyticsHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={onAddTeam}
            className="h-8"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Team
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={onDeleteTeam}
            className="h-8" 
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete Team
          </Button>
        </div>
      </div>
      
      <FilterBar
        selectedTeam={selectedTeam}
        teams={["all", ...teams]}
        onTeamChange={onTeamChange}
      />
    </div>
  );
}
