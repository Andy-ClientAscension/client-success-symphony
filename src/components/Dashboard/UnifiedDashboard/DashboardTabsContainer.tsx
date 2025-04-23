
import React, { useState } from "react";
import { UnifiedTabNavigation } from "@/components/Dashboard/Tabs/UnifiedTabNavigation";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { DashboardOverview } from "./DashboardOverview";
import { CompanyMetrics } from "../CompanyMetrics";
import { TeamAnalytics } from "../TeamAnalytics";
import { FilterBar } from "../Shared/FilterBar";

// Define your tab structure with descriptive labels
const dashboardTabs = [
  { id: "overview", label: "Executive Overview" },
  { id: "company", label: "Company Performance Metrics" },
  { id: "team", label: "Team Analytics & Performance" }
];

interface DashboardTabsContainerProps {
  data?: any;
  metrics?: any;
  teamData?: any;
}

export function DashboardTabsContainer({ data, metrics, teamData }: DashboardTabsContainerProps) {
  const { activeTab, handleTabChange } = useTabNavigation<"overview" | "company" | "team">("overview");

  // Example: contextual state for filters (expand according to your app's data)
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [searchQuery, setSearchQuery] = useState("");

  // Example: team list pulled from props or static
  const teams = ["all", "Team-Andy", "Team-Chris", "Team-Alex", "Team-Cillin", "Enterprise", "SMB", "Mid-Market"];
  const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "This year", "All time"];

  return (
    <div>
      {/* Contextual Filter Section */}
      {activeTab === "team" && (
        <FilterBar
          selectedTeam={selectedTeam}
          teams={teams}
          onTeamChange={setSelectedTeam}
          selectedDateRange={dateRange}
          dateRanges={dateRanges}
          onDateRangeChange={setDateRange}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          filterConfig={{
            showTeamFilter: true,
            showDateFilter: true,
            showSearch: true,
            showSort: false
          }}
        />
      )}
      {/* Tabs Navigation + Descriptive Groupings */}
      <UnifiedTabNavigation
        tabs={dashboardTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {activeTab === "overview" && (
          <section aria-label="Executive Overview Visuals">
            <DashboardOverview />
          </section>
        )}
        {activeTab === "company" && (
          <section aria-label="Company Performance Visuals">
            <CompanyMetrics />
          </section>
        )}
        {activeTab === "team" && (
          <section aria-label="Team Analytics & Performance Visuals">
            {/* Pass contextual state as needed, only show filters relevant to this tab */}
            <TeamAnalytics 
              selectedTeam={selectedTeam}
              dateRange={dateRange}
              searchQuery={searchQuery}
            />
          </section>
        )}
      </UnifiedTabNavigation>
    </div>
  );
}
