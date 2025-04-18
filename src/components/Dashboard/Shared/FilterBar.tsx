
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamFilter } from "../RenewalsSummary/TeamFilter";
import { Filter, Calendar, SortAsc, SortDesc } from "lucide-react";

interface FilterBarProps {
  selectedTeam: string;
  teams: string[];
  onTeamChange: (team: string) => void;
  selectedDateRange?: string;
  dateRanges?: string[];
  onDateRangeChange?: (range: string) => void;
  selectedSortOrder?: string;
  onSortOrderChange?: (order: string) => void;
  additionalFilters?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  selectedTeam,
  teams,
  onTeamChange,
  selectedDateRange,
  dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "This year", "All time"],
  onDateRangeChange,
  selectedSortOrder,
  onSortOrderChange,
  additionalFilters,
  className = ""
}: FilterBarProps) {
  const formatTeamName = (team: string) => {
    if (team === "all") return "All Teams";
    return team.replace(/^Team-/, "Team ");
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 mb-4 ${className}`}>
      <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-md">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      
      <TeamFilter
        selectedTeam={selectedTeam}
        setSelectedTeam={onTeamChange}
        teams={teams}
        formatTeamName={formatTeamName}
      />
      
      {onDateRangeChange && dateRanges && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {onSortOrderChange && (
        <div className="flex items-center gap-2">
          {selectedSortOrder === "desc" ? (
            <SortDesc className="h-4 w-4 text-muted-foreground" />
          ) : (
            <SortAsc className="h-4 w-4 text-muted-foreground" />
          )}
          <Select value={selectedSortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {additionalFilters}
    </div>
  );
}
