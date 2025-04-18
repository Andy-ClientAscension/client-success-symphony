
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Calendar, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResponsiveGrid } from "./ResponsiveGrid";
import { Card } from "@/components/ui/card";

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
    <Card className={`p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-800/20 shadow-sm border border-border/10 ${className}`}>
      <ResponsiveGrid 
        cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} 
        gap="sm" 
        className="items-center"
      >
        {showTeamFilter && (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/40 p-2 rounded-md min-h-[44px] shadow-sm">
            <Users className="h-4 w-4 text-brand-500/70 shrink-0" />
            <Select value={selectedTeam} onValueChange={onTeamChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 border-0 bg-transparent focus:ring-0 text-sm sm:text-base">
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
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/40 p-2 rounded-md min-h-[44px] shadow-sm">
            <Calendar className="h-4 w-4 text-brand-500/70 shrink-0" />
            <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 border-0 bg-transparent focus:ring-0 text-sm sm:text-base">
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
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800/40 p-2 rounded-md min-h-[44px] shadow-sm">
              <Search className="h-4 w-4 text-brand-500/70 shrink-0" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={onSearchChange}
                className="border-0 bg-transparent focus-visible:ring-0 px-0 h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
          </div>
        )}

        {showSort && onSortOrderChange && (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/40 p-2 rounded-md min-h-[44px] shadow-sm">
            {selectedSortOrder === "desc" ? (
              <SortDesc className="h-4 w-4 text-brand-500/70 shrink-0" />
            ) : (
              <SortAsc className="h-4 w-4 text-brand-500/70 shrink-0" />
            )}
            <Select 
              value={selectedSortOrder} 
              onValueChange={(value: "asc" | "desc") => onSortOrderChange(value)}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-10 border-0 bg-transparent focus:ring-0 text-sm sm:text-base">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {additionalFilters && (
          <div className="flex items-center gap-2">
            {additionalFilters}
          </div>
        )}
      </ResponsiveGrid>
    </Card>
  );
}
