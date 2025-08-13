import { useState, useCallback, useEffect } from 'react';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface FilterState {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  teams: string[];
  statuses: string[];
  searchQuery: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTeams?: string[];
  availableStatuses?: string[];
  className?: string;
}

const defaultStatuses = ['new', 'active', 'at-risk', 'churned', 'paused', 'graduated'];
const defaultTeams = ['Team A', 'Team B', 'Team C', 'Team D'];

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableTeams = defaultTeams,
  availableStatuses = defaultStatuses,
  className
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const activeFilterCount = [
    filters.dateRange.from || filters.dateRange.to ? 1 : 0,
    filters.teams.length,
    filters.statuses.length,
    filters.searchQuery ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  const handleDateRangeChange = useCallback((range: { from: Date | null; to: Date | null }) => {
    const newFilters = {
      ...localFilters,
      dateRange: range
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleTeamToggle = useCallback((team: string) => {
    const newTeams = localFilters.teams.includes(team)
      ? localFilters.teams.filter(t => t !== team)
      : [...localFilters.teams, team];
    
    const newFilters = {
      ...localFilters,
      teams: newTeams
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleStatusToggle = useCallback((status: string) => {
    const newStatuses = localFilters.statuses.includes(status)
      ? localFilters.statuses.filter(s => s !== status)
      : [...localFilters.statuses, status];
    
    const newFilters = {
      ...localFilters,
      statuses: newStatuses
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: FilterState = {
      dateRange: { from: null, to: null },
      teams: [],
      statuses: [],
      searchQuery: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const clearDateRange = useCallback(() => {
    handleDateRangeChange({ from: null, to: null });
  }, [handleDateRangeChange]);

  const formatDateRange = () => {
    if (!filters.dateRange.from && !filters.dateRange.to) return null;
    if (filters.dateRange.from && !filters.dateRange.to) {
      return `From ${format(filters.dateRange.from, 'MMM dd')}`;
    }
    if (!filters.dateRange.from && filters.dateRange.to) {
      return `Until ${format(filters.dateRange.to, 'MMM dd')}`;
    }
    if (filters.dateRange.from && filters.dateRange.to) {
      return `${format(filters.dateRange.from, 'MMM dd')} - ${format(filters.dateRange.to, 'MMM dd')}`;
    }
    return null;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8">
                    <Calendar className="h-3 w-3 mr-2" />
                    {formatDateRange() || 'Select date range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: filters.dateRange.from || undefined,
                      to: filters.dateRange.to || undefined
                    }}
                    onSelect={(range) => {
                      handleDateRangeChange({
                        from: range?.from || null,
                        to: range?.to || null
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Teams */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Teams</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableTeams.map((team) => (
                  <div key={team} className="flex items-center space-x-2">
                    <Checkbox
                      id={`team-${team}`}
                      checked={filters.teams.includes(team)}
                      onCheckedChange={() => handleTeamToggle(team)}
                    />
                    <Label htmlFor={`team-${team}`} className="text-xs">
                      {team}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Statuses */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Status</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-xs capitalize">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      <div className="flex items-center gap-1 flex-wrap">
        {formatDateRange() && (
          <Badge variant="secondary" className="h-6 text-xs">
            {formatDateRange()}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateRange}
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {filters.teams.map((team) => (
          <Badge key={`team-${team}`} variant="secondary" className="h-6 text-xs">
            {team}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTeamToggle(team)}
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {filters.statuses.map((status) => (
          <Badge key={`status-${status}`} variant="secondary" className="h-6 text-xs capitalize">
            {status}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusToggle(status)}
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Hook for managing filter state
export function useAdvancedFilters(initialFilters?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null },
    teams: [],
    statuses: [],
    searchQuery: '',
    ...initialFilters
  });

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: { from: null, to: null },
      teams: [],
      statuses: [],
      searchQuery: ''
    });
  }, []);

  const hasActiveFilters = !!(
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.teams.length > 0 ||
    filters.statuses.length > 0 ||
    filters.searchQuery
  );

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters
  };
}