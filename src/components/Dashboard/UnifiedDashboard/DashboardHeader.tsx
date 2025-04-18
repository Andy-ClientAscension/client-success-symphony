
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { FilterBar } from "../Shared/FilterBar";
import { getAllTeams } from "@/lib/data";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  handleRefreshData: () => void;
}

export function DashboardHeader({ isRefreshing, handleRefreshData }: DashboardHeaderProps) {
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 days");
  const teams = ["all", ...getAllTeams()];

  return (
    <header 
      className="space-y-4" 
      role="banner" 
      aria-label="Dashboard Header"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 
          className="text-2xl font-bold" 
          tabIndex={0}
          aria-label="Unified Dashboard"
        >
          Unified Dashboard
        </h1>
        <Button
          onClick={handleRefreshData}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="h-9"
          aria-label={isRefreshing ? "Refreshing data..." : "Refresh dashboard data"}
        >
          <RefreshCw 
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} 
            aria-hidden="true"
          />
          <span className="sr-only">{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
          <span aria-hidden="true">{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
        </Button>
      </div>
      
      <FilterBar
        selectedTeam={selectedTeam}
        teams={teams}
        onTeamChange={setSelectedTeam}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        selectedSortOrder="desc"
        onSortOrderChange={(order) => console.log(`Sort order changed to ${order}`)}
        aria-label="Dashboard filters"
      />
    </header>
  );
}
