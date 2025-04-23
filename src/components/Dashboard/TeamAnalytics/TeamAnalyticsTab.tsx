
import React from "react";
import { TeamAnalytics } from "./TeamAnalytics";

interface TeamAnalyticsTabProps {
  clients: any[];
  selectedTeam?: string;
}

export function TeamAnalyticsTab({ clients, selectedTeam = 'all' }: TeamAnalyticsTabProps) {
  return <TeamAnalytics selectedTeam={selectedTeam} />;
}
