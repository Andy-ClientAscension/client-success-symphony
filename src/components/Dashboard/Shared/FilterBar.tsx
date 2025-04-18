import React from "react";
import { Filter } from "lucide-react";
import { UnifiedFilter, FilterConfig } from "./UnifiedFilter";

interface FilterBarProps {
  selectedTeam: string;
  teams: string[];
  onTeamChange: (team: string) => void;
  selectedDateRange?: string;
  dateRanges?: string[];
  onDateRangeChange?: (range: string) => void;
  selectedSortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filterConfig?: FilterConfig;
  additionalFilters?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  selectedTeam,
  teams,
  onTeamChange,
  selectedDateRange,
  dateRanges,
  onDateRangeChange,
  selectedSortOrder,
  onSortOrderChange,
  searchQuery,
  onSearchChange,
  filterConfig = {
    showTeamFilter: true,
    showDateFilter: true,
    showSearch: false,
    showSort: false
  },
  additionalFilters,
  className = ""
}: FilterBarProps) {
  return (
    <div className={`sticky top-0 z-10 -mx-6 px-6 py-4 bg-background/95 backdrop-blur-sm border-b ${className}`}>
      <UnifiedFilter
        selectedTeam={selectedTeam}
        teams={teams}
        onTeamChange={onTeamChange}
        selectedDateRange={selectedDateRange}
        dateRanges={dateRanges}
        onDateRangeChange={onDateRangeChange}
        selectedSortOrder={selectedSortOrder}
        onSortOrderChange={onSortOrderChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        {...filterConfig}
        additionalFilters={additionalFilters}
      />
    </div>
  );
}
