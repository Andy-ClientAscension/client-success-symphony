
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

interface DashboardTabsContainerProps {
  data?: any;
  metrics?: any;
  teamData?: any;
}

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

