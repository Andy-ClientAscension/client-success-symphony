
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientMetricsByTeam, getAllClients, getCSMList } from "@/lib/data";
import { CheckCircle2, AlertTriangle, ArrowDownRight, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TeamMetricCard } from "./TeamMetricCard";
import { TeamStatusMetric } from "./TeamStatusMetric";
import { SSCPerformanceTable } from "./SSCPerformanceTable";

export function TeamAnalytics() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  
  // Get list of unique teams from client data
  const clients = getAllClients();
  const teamSet = new Set<string>();
  clients.forEach(client => {
    if (client.team) {
      teamSet.add(client.team);
    }
  });
  
  const teams = Array.from(teamSet);
  const csmList = getCSMList();
  
  // Filter clients by selected team
  const teamClients = selectedTeam === "all" 
    ? clients 
    : clients.filter(client => client.team === selectedTeam);
  
  // Calculate team metrics
  const metrics = getClientMetricsByTeam();
  const teamMetrics = selectedTeam === "all" ? metrics : getClientMetricsByTeam(selectedTeam);
  
  // Calculate status counts for selected team
  const statusCounts = {
    active: teamClients.filter(client => client.status === 'active').length,
    atRisk: teamClients.filter(client => client.status === 'at-risk').length,
    churned: teamClients.filter(client => client.status === 'churned').length,
    new: teamClients.filter(client => client.status === 'new').length,
    total: teamClients.length
  };
  
  // Calculate previous period metrics (simulated for this example)
  // In a real app, this would come from historical data
  const prevPeriodRetention = Math.max(0, Math.round(retentionRate - (Math.random() * 10 - 5)));
  const prevPeriodAtRisk = Math.max(0, Math.round(atRiskRate - (Math.random() * 10 - 3)));
  const prevPeriodChurn = Math.max(0, Math.round(churnRate - (Math.random() * 10 - 2)));
  
  // Calculate trends
  const retentionTrend = retentionRate - prevPeriodRetention;
  const atRiskTrend = atRiskRate - prevPeriodAtRisk;
  const churnTrend = churnRate - prevPeriodChurn;
  
  const retentionRate = statusCounts.total > 0 
    ? Math.round((statusCounts.active / statusCounts.total) * 100) 
    : 0;
    
  const atRiskRate = statusCounts.total > 0 
    ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) 
    : 0;
    
  const churnRate = statusCounts.total > 0 
    ? Math.round((statusCounts.churned / statusCounts.total) * 100) 
    : 0;

  // Helper function to get trend indicator component
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
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
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

        <SSCPerformanceTable 
          csmList={csmList}
          clients={clients}
          selectedTeam={selectedTeam}
        />
      </CardContent>
    </Card>
  );
}
