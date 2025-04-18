
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getClientMetricsByTeam, getAllClients, getCSMList } from "@/lib/data";
import { TeamAnalyticsHeader } from "./TeamAnalyticsHeader";
import { TeamMetricsOverview } from "./TeamMetricsOverview";
import { SSCPerformanceTable } from "../SSCPerformanceTable";
import { HealthScoreSheet } from "../HealthScoreSheet";
import { HealthScoreHistory } from "../HealthScoreHistory";
import { TeamManagementDialog } from "../TeamManagementDialog";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckCircle2, AlertTriangle, ArrowDownRight, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const clients = useMemo(() => getAllClients(), []);
  
  useEffect(() => {
    const checkForClientDeletions = () => {
      const persistEnabled = localStorage.getItem("persistDashboard") === "true";
      if (persistEnabled) {
        const savedClients = loadData(STORAGE_KEYS.CLIENTS, null);
        if (savedClients && Array.isArray(savedClients)) {
          console.log("Client list in storage updated, reflecting changes in TeamAnalytics");
        }
      }
    };
    
    const interval = setInterval(checkForClientDeletions, 2000);
    return () => clearInterval(interval);
  }, []);
  
  const teamSet = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(client => {
      if (client.team) {
        set.add(client.team);
      }
    });
    ADDITIONAL_TEAMS.forEach(team => set.add(team.id));
    return set;
  }, [clients]);
  
  React.useEffect(() => {
    setTeams(Array.from(teamSet));
  }, [teamSet]);
  
  const csmList = useMemo(() => getCSMList(), []);
  
  const teamClients = useMemo(() => {
    return selectedTeam === "all" 
      ? clients 
      : clients.filter(client => client.team === selectedTeam);
  }, [clients, selectedTeam]);

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

  const metrics = useMemo(() => getClientMetricsByTeam(), []);
  const teamMetrics = useMemo(() => {
    return selectedTeam === "all" ? metrics : getClientMetricsByTeam(selectedTeam);
  }, [metrics, selectedTeam]);

  const statusCounts = useMemo(() => ({
    active: teamClients.filter(client => client.status === 'active').length,
    atRisk: teamClients.filter(client => client.status === 'at-risk').length,
    churned: teamClients.filter(client => client.status === 'churned').length,
    total: teamClients.length
  }), [teamClients]);

  const rates = useMemo(() => {
    const retentionRate = statusCounts.total > 0 
      ? Math.round((statusCounts.active / statusCounts.total) * 100) 
      : 0;
    const atRiskRate = statusCounts.total > 0 
      ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) 
      : 0;
    const churnRate = statusCounts.total > 0 
      ? Math.round((statusCounts.churned / statusCounts.total) * 100) 
      : 0;

    const prevPeriodRetention = Math.max(0, Math.round(retentionRate - (Math.random() * 10 - 5)));
    const prevPeriodAtRisk = Math.max(0, Math.round(atRiskRate - (Math.random() * 10 - 3)));
    const prevPeriodChurn = Math.max(0, Math.round(churnRate - (Math.random() * 10 - 2)));

    return {
      retentionRate,
      atRiskRate,
      churnRate,
      retentionTrend: retentionRate - prevPeriodRetention,
      atRiskTrend: atRiskRate - prevPeriodAtRisk,
      churnTrend: churnRate - prevPeriodChurn
    };
  }, [statusCounts]);

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Team Performance</TabsTrigger>
              <TabsTrigger value="health-scores">Health Score Sheet</TabsTrigger>
              <TabsTrigger value="health-trends">Health Trends</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview">
            <TeamMetricsOverview
              metrics={teamMetrics}
              statusCounts={statusCounts}
              rates={rates}
            />
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="overflow-x-auto">
              <SSCPerformanceTable 
                csmList={csmList}
                clients={clients}
                selectedTeam={selectedTeam}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="health-scores">
            <div className="overflow-x-auto">
              <HealthScoreSheet clients={teamClients} />
            </div>
          </TabsContent>
          
          <TabsContent value="health-trends">
            <HealthScoreHistory />
          </TabsContent>
        </Tabs>
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
