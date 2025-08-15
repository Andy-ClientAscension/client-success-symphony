import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentFiltersProps {
  teams: string[];
  sscs: string[];
  selectedTeam: string;
  selectedSSC: string;
  onTeamChange: (team: string) => void;
  onSSCChange: (ssc: string) => void;
  onClearFilters: () => void;
}

export function StudentFilters({
  teams,
  sscs,
  selectedTeam,
  selectedSSC,
  onTeamChange,
  onSSCChange,
  onClearFilters
}: StudentFiltersProps) {
  const hasActiveFilters = selectedTeam !== "all" || selectedSSC !== "all";

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {[selectedTeam !== "all" && "Team", selectedSSC !== "all" && "SSC"]
                .filter(Boolean)
                .length} active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Team
          </label>
          <Select value={selectedTeam} onValueChange={onTeamChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Student Success Consultant
          </label>
          <Select value={selectedSSC} onValueChange={onSSCChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All SSCs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SSCs</SelectItem>
              <SelectItem value="none">No SSC Assigned</SelectItem>
              {sscs.map((ssc) => (
                <SelectItem key={ssc} value={ssc}>
                  {ssc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Active filters:</span>
          {selectedTeam !== "all" && (
            <Badge variant="outline" className="text-xs">
              Team: {selectedTeam}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onTeamChange("all")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {selectedSSC !== "all" && (
            <Badge variant="outline" className="text-xs">
              SSC: {selectedSSC === "none" ? "No SSC" : selectedSSC}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onSSCChange("all")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}