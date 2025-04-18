
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Unified Dashboard</h1>
        <Button
          onClick={handleRefreshData}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="h-9"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
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
      />
    </div>
  );
}
