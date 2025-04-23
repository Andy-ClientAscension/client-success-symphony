import React from "react";
import { UnifiedTabNavigation } from "@/components/Dashboard/Tabs/UnifiedTabNavigation";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { DashboardOverview } from "./DashboardOverview";
import { CompanyMetrics } from "../CompanyMetrics";
import { TeamAnalytics } from "../TeamAnalytics";

// Define your tab structure
const dashboardTabs = [
  { id: "overview", label: "Overview" },
  { id: "company", label: "Company" },
  { id: "team", label: "Team Analytics" }
];

// Define proper interfaces for child component props
interface DashboardOverviewProps {
  data?: any;
}

interface CompanyMetricsProps {
  metrics?: any;
}

interface TeamAnalyticsProps {
  teamData?: any;
}

interface DashboardTabsContainerProps {
  data?: any;
  metrics?: any;
  teamData?: any;
}

// Declare the components with their prop types
const TypedDashboardOverview: React.FC<DashboardOverviewProps> = DashboardOverview;
const TypedCompanyMetrics: React.FC<CompanyMetricsProps> = CompanyMetrics;
const TypedTeamAnalytics: React.FC<TeamAnalyticsProps> = TeamAnalytics;

export function DashboardTabsContainer({ data, metrics, teamData }: DashboardTabsContainerProps) {
  const { activeTab, handleTabChange } = useTabNavigation<"overview" | "company" | "team">("overview");

  return (
    <UnifiedTabNavigation
      tabs={dashboardTabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === "overview" && <DashboardOverview data={data} />}
      {activeTab === "company" && <CompanyMetrics metrics={metrics} />}
      {activeTab === "team" && <TeamAnalytics teamData={teamData} />}
    </UnifiedTabNavigation>
  );
}
