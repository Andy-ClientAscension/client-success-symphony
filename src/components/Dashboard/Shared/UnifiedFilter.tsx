
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Calendar, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResponsiveGrid } from "./ResponsiveGrid";

export interface FilterConfig {
  showTeamFilter?: boolean;
  showDateFilter?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  additionalFilters?: React.ReactNode;
}

interface UnifiedFilterProps extends FilterConfig {
  selectedTeam: string;
  teams: string[];
  onTeamChange: (team: string) => void;
  selectedDateRange?: string;
  dateRanges?: string[];
  onDateRangeChange?: (range: string) => void;
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedSortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  className?: string;
}

export function UnifiedFilter({
  selectedTeam,
  teams,
  onTeamChange,
  selectedDateRange,
  dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "This year", "All time"],
  onDateRangeChange,
  searchQuery,
  onSearchChange,
  selectedSortOrder,
  onSortOrderChange,
  showTeamFilter = true,
  showDateFilter = false,
  showSearch = false,
  showSort = false,
  additionalFilters,
  className = "",
}: UnifiedFilterProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ResponsiveGrid 
        cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} 
        gap="md" 
        className="items-center"
      >
        {showTeamFilter && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedTeam} onValueChange={onTeamChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team === "all" ? "All Teams" : team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showDateFilter && onDateRangeChange && (
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

        {showSearch && onSearchChange && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={onSearchChange}
              className="pl-8"
            />
          </div>
        )}

        {showSort && onSortOrderChange && (
          <div className="flex items-center gap-2">
            {selectedSortOrder === "desc" ? (
              <SortDesc className="h-4 w-4 text-muted-foreground" />
            ) : (
              <SortAsc className="h-4 w-4 text-muted-foreground" />
            )}
            <Select 
              value={selectedSortOrder} 
              onValueChange={(value: "asc" | "desc") => onSortOrderChange(value)}
            >
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
      </ResponsiveGrid>
    </div>
  );
}
