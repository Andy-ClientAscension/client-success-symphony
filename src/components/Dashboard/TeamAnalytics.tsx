import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientMetricsByTeam, getAllClients, getCSMList } from "@/lib/data";
import { CheckCircle2, AlertTriangle, ArrowDownRight, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TeamMetricCard } from "./TeamMetricCard";
import { TeamStatusMetric } from "./TeamStatusMetric";
import { SSCPerformanceTable } from "./SSCPerformanceTable";
import { HealthScoreSheet } from "./HealthScoreSheet";
import { HealthScoreHistory } from "./HealthScoreHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const ADDITIONAL_TEAMS = [
  { id: "Enterprise", name: "Enterprise" },
  { id: "SMB", name: "SMB" },
  { id: "Mid-Market", name: "Mid Market" },
];

export function TeamAnalytics() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const clients = useMemo(() => getAllClients(), []);
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
  
  const teams = useMemo(() => Array.from(teamSet), [teamSet]);
  const csmList = useMemo(() => getCSMList(), []);
  
  const teamClients = useMemo(() => {
    return selectedTeam === "all" 
      ? clients 
      : clients.filter(client => client.team === selectedTeam);
  }, [clients, selectedTeam]);
  
  const metrics = useMemo(() => getClientMetricsByTeam(), []);
  const teamMetrics = useMemo(() => {
    return selectedTeam === "all" ? metrics : getClientMetricsByTeam(selectedTeam);
  }, [metrics, selectedTeam]);
  
  const statusCounts = useMemo(() => ({
    active: teamClients.filter(client => client.status === 'active').length,
    atRisk: teamClients.filter(client => client.status === 'at-risk').length,
    churned: teamClients.filter(client => client.status === 'churned').length,
    new: teamClients.filter(client => client.status === 'new').length,
    total: teamClients.length
  }), [teamClients]);
  
  const retentionRate = useMemo(() => {
    return statusCounts.total > 0 
      ? Math.round((statusCounts.active / statusCounts.total) * 100) 
      : 0;
  }, [statusCounts]);
    
  const atRiskRate = useMemo(() => {
    return statusCounts.total > 0 
      ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) 
      : 0;
  }, [statusCounts]);
    
  const churnRate = useMemo(() => {
    return statusCounts.total > 0 
      ? Math.round((statusCounts.churned / statusCounts.total) * 100) 
      : 0;
  }, [statusCounts]);
  
  const prevPeriodRetention = useMemo(() => {
    return Math.max(0, Math.round(retentionRate - (Math.random() * 10 - 5)));
  }, [retentionRate]);
  
  const prevPeriodAtRisk = useMemo(() => {
    return Math.max(0, Math.round(atRiskRate - (Math.random() * 10 - 3)));
  }, [atRiskRate]);
  
  const prevPeriodChurn = useMemo(() => {
    return Math.max(0, Math.round(churnRate - (Math.random() * 10 - 2)));
  }, [churnRate]);
  
  const retentionTrend = useMemo(() => retentionRate - prevPeriodRetention, [retentionRate, prevPeriodRetention]);
  const atRiskTrend = useMemo(() => atRiskRate - prevPeriodAtRisk, [atRiskRate, prevPeriodAtRisk]);
  const churnTrend = useMemo(() => churnRate - prevPeriodChurn, [churnRate, prevPeriodChurn]);

  const getTrendIndicator = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 ml-1" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 ml-1" />;
    return <Minus className="h-3 w-3 ml-1" />;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Team Analytics</CardTitle>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team === "Team-Andy" ? "Team Andy" : 
                   team === "Team-Chris" ? "Team Chris" : 
                   team === "Team-Alex" ? "Team Alex" : 
                   team === "Team-Cillin" ? "Team Cillin" :
                   team === "Enterprise" ? "Enterprise" :
                   team === "SMB" ? "SMB" :
                   team === "Mid-Market" ? "Mid Market" : team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
            <TabsTrigger value="health-scores">Health Score Sheet</TabsTrigger>
            <TabsTrigger value="health-trends">Health Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <TeamMetricCard 
                title="Total MRR" 
                value={`$${teamMetrics.totalMRR}`}
                trend={8}
              />
              
              <TeamMetricCard 
                title="Calls Booked" 
                value={teamMetrics.totalCallsBooked}
                trend={12}
              />
              
              <TeamMetricCard 
                title="Deals Closed" 
                value={teamMetrics.totalDealsClosed}
                trend={5}
              />
              
              <TeamMetricCard 
                title="Client Count" 
                value={statusCounts.total}
                trend={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <TeamStatusMetric 
                title="Retention Rate"
                value={retentionRate}
                color="text-green-600"
                icon={<CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />}
                count={statusCounts.active}
                label="active clients"
                trend={{
                  value: retentionTrend,
                  indicator: getTrendIndicator(retentionTrend)
                }}
              />
              
              <TeamStatusMetric 
                title="At Risk Rate"
                value={atRiskRate}
                color="text-amber-600"
                icon={<AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />}
                count={statusCounts.atRisk}
                label="at-risk clients"
                trend={{
                  value: -atRiskTrend,
                  indicator: getTrendIndicator(-atRiskTrend)
                }}
              />
              
              <TeamStatusMetric 
                title="Churn Rate"
                value={churnRate}
                color="text-red-600"
                icon={<ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />}
                count={statusCounts.churned}
                label="churned clients"
                trend={{
                  value: -churnTrend,
                  indicator: getTrendIndicator(-churnTrend)
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <SSCPerformanceTable 
              csmList={csmList}
              clients={clients}
              selectedTeam={selectedTeam}
            />
          </TabsContent>
          
          <TabsContent value="health-scores">
            <HealthScoreSheet clients={teamClients} />
          </TabsContent>
          
          <TabsContent value="health-trends">
            <HealthScoreHistory />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
