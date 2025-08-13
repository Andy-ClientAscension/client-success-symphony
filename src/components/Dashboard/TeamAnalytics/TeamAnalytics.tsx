
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TeamAnalyticsHeader } from "./TeamAnalyticsHeader";
import { TeamAnalyticsTabs } from "./TeamAnalyticsTabs";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getAllClients } from "@/lib/data";
import { ADDITIONAL_TEAMS } from "./constants";

interface TeamAnalyticsProps {
  selectedTeam?: string;
  dateRange?: string;
  searchQuery?: string;
}

export function TeamAnalytics({
  selectedTeam: initialTeam = "all",
  dateRange,
  searchQuery
}: TeamAnalyticsProps) {
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [activeTab, setActiveTab] = useState("overview");
  const { teamMetrics: metrics, teamStatusCounts, isLoading: loading, error, refetchData: refetch } = useDashboardData({ teamFilter: selectedTeam });
  const allClients = getAllClients();
  
  // Mock data structure for compatibility
  const teamData = {
    statusCounts: teamStatusCounts,
    trends: { retentionTrend: 2.5, atRiskTrend: -1.2, churnTrend: -0.8 },
    metrics: { totalMRR: teamStatusCounts?.total * 5000 || 0, totalCallsBooked: allClients.length * 2, totalDealsClosed: allClients.length }
  };
  
  // Filter clients for the selected team
  const teamClients = selectedTeam === 'all'
    ? allClients
    : allClients.filter(client => client.team === selectedTeam);
  
  // Get list of unique CSMs from the clients
  const csmList = Array.from(new Set(allClients.map(client => client.csm))).filter(Boolean) as string[];

  const handleTeamChange = (team: string) => {
    setSelectedTeam(team);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Prepare performance data for tabs
  const performanceData = {
    teamClients,
    statusCounts: teamData.statusCounts,
    rates: {
      retentionRate: metrics.retentionRate,
      atRiskRate: metrics.atRiskRate,
      churnRate: metrics.churnRate
    },
    trends: teamData.trends,
    metrics: teamData.metrics
  };

  const handleAddTeam = () => {
    // In a real app, this would open a modal to add a new team
    console.log('Add team functionality would be implemented here');
  };

  const handleDeleteTeam = () => {
    // In a real app, this would open a modal to delete the selected team
    console.log('Delete team functionality would be implemented here');
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <TeamAnalyticsHeader
            selectedTeam={selectedTeam}
            teams={ADDITIONAL_TEAMS.map(team => team.id)}
            onTeamChange={handleTeamChange}
            onAddTeam={handleAddTeam}
            onDeleteTeam={handleDeleteTeam}
          />
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
              Error loading team data: {error.message}
            </div>
          ) : (
            <TeamAnalyticsTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              performanceData={performanceData}
              csmList={csmList}
              clients={teamClients}
              selectedTeam={selectedTeam}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
