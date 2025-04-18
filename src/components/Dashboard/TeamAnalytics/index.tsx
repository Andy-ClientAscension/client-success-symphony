
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAllClients, getCSMList } from "@/lib/data";
import { TeamAnalyticsHeader } from "./TeamAnalyticsHeader";
import { TeamManagementDialog } from "../TeamManagementDialog";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { getTeamPerformanceData } from "@/utils/analyticsUtils";
import { TeamAnalyticsTabs } from "./TeamAnalyticsTabs";

const ADDITIONAL_TEAMS = [
  { id: "Enterprise", name: "Enterprise" },
  { id: "SMB", name: "SMB" },
  { id: "Mid-Market", name: "Mid Market" },
];

export function TeamAnalytics() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [teams, setTeams] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'add' | 'delete'>('add');
  const [clients, setClients] = useState(() => getAllClients());
  const { toast } = useToast();
  const csmList = getCSMList();
  
  // Monitor for client deletions in localStorage
  useEffect(() => {
    const checkForClientDeletions = () => {
      const persistEnabled = localStorage.getItem("persistDashboard") === "true";
      if (persistEnabled) {
        const savedClients = loadData(STORAGE_KEYS.CLIENTS, null);
        if (savedClients && Array.isArray(savedClients)) {
          setClients(getAllClients());
        }
      }
    };
    
    const interval = setInterval(checkForClientDeletions, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // Extract unique teams from client data
  useEffect(() => {
    const teamSet = new Set<string>();
    clients.forEach(client => {
      if (client.team) {
        teamSet.add(client.team);
      }
    });
    
    ADDITIONAL_TEAMS.forEach(team => teamSet.add(team.id));
    setTeams(Array.from(teamSet));
  }, [clients]);
  
  // Get team performance data and extract teamClients
  const rawPerformanceData = getTeamPerformanceData(selectedTeam, clients);
  
  // Create the properly structured performance data object that matches the expected type
  const performanceData = {
    teamClients: selectedTeam === "all" 
      ? clients 
      : clients.filter(client => client.team === selectedTeam),
    statusCounts: rawPerformanceData.statusCounts,
    rates: rawPerformanceData.rates,
    trends: rawPerformanceData.trends,
    metrics: {
      totalMRR: rawPerformanceData.totalMRR,
      totalCallsBooked: rawPerformanceData.totalCallsBooked,
      totalDealsClosed: rawPerformanceData.totalDealsClosed,
      clientCount: rawPerformanceData.clientCount
    }
  };
  
  const handleTeamAction = (teamName: string) => {
    if (dialogAction === 'add') {
      if (teams.some(team => team.toLowerCase() === teamName.toLowerCase())) {
        toast({
          title: "Team Already Exists",
          description: `"${teamName}" is already in the team list.`,
          variant: "destructive",
        });
        return;
      }
      
      setTeams(prev => [...prev, teamName]);
      
      toast({
        title: "Team Added",
        description: `"${teamName}" has been added to the team list.`,
      });
    } else if (dialogAction === 'delete') {
      setTeams(prev => prev.filter(team => team !== selectedTeam));
      
      if (selectedTeam === teamName) {
        setSelectedTeam('all');
      }
      
      toast({
        title: "Team Deleted",
        description: `"${teamName}" has been removed from the team list.`,
      });
    }
    
    setDialogOpen(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">Team Analytics</CardTitle>
          <div className="w-full md:w-auto">
            <TeamAnalyticsHeader
              selectedTeam={selectedTeam}
              teams={teams}
              onTeamChange={setSelectedTeam}
              onAddTeam={() => {
                setDialogAction('add');
                setDialogOpen(true);
              }}
              onDeleteTeam={() => {
                if (selectedTeam === 'all') {
                  toast({
                    title: "Select a Team",
                    description: "Please select a specific team to delete.",
                    variant: "destructive",
                  });
                  return;
                }
                setDialogAction('delete');
                setDialogOpen(true);
              }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <TeamAnalyticsTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          performanceData={performanceData}
          csmList={csmList}
          clients={clients}
          selectedTeam={selectedTeam}
        />
      </CardContent>

      <TeamManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionType={dialogAction}
        selectedTeam={selectedTeam !== 'all' ? selectedTeam : undefined}
        onConfirm={handleTeamAction}
      />
    </Card>
  );
}
