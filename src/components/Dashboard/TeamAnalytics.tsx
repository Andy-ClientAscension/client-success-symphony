
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientMetricsByTeam, getAllClients, getCSMList } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ArrowUpRight, ArrowDownRight, Users, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  
  const retentionRate = statusCounts.total > 0 
    ? Math.round((statusCounts.active / statusCounts.total) * 100) 
    : 0;
    
  const atRiskRate = statusCounts.total > 0 
    ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) 
    : 0;
    
  const churnRate = statusCounts.total > 0 
    ? Math.round((statusCounts.churned / statusCounts.total) * 100) 
    : 0;

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
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
            <span className="text-xs text-muted-foreground">Total MRR</span>
            <div className="flex items-baseline mt-1">
              <span className="text-xl font-bold">${teamMetrics.totalMRR}</span>
              <span className="ml-2 text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
            <span className="text-xs text-muted-foreground">Calls Booked</span>
            <div className="flex items-baseline mt-1">
              <span className="text-xl font-bold">{teamMetrics.totalCallsBooked}</span>
              <span className="ml-2 text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
            <span className="text-xs text-muted-foreground">Deals Closed</span>
            <div className="flex items-baseline mt-1">
              <span className="text-xl font-bold">{teamMetrics.totalDealsClosed}</span>
              <span className="ml-2 text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                5%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
            <span className="text-xs text-muted-foreground">Client Count</span>
            <div className="flex items-baseline mt-1">
              <span className="text-xl font-bold">{statusCounts.total}</span>
              <span className="ml-2 text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                3%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Retention Rate</span>
              <span className="text-sm font-semibold text-green-600">{retentionRate}%</span>
            </div>
            <Progress value={retentionRate} className="h-2" />
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" /> 
              <span>{statusCounts.active} active clients</span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">At Risk Rate</span>
              <span className="text-sm font-semibold text-amber-600">{atRiskRate}%</span>
            </div>
            <Progress value={atRiskRate} className="h-2" />
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" /> 
              <span>{statusCounts.atRisk} at-risk clients</span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Churn Rate</span>
              <span className="text-sm font-semibold text-red-600">{churnRate}%</span>
            </div>
            <Progress value={churnRate} className="h-2" />
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" /> 
              <span>{statusCounts.churned} churned clients</span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-medium mb-2">Student Success Coach Performance</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">SSC</TableHead>
                <TableHead className="text-right">Clients</TableHead>
                <TableHead className="text-right">Backend Students</TableHead>
                <TableHead className="text-right">Team Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csmList.filter(csm => {
                if (selectedTeam === "all") return true;
                return clients.some(client => client.csm === csm && client.team === selectedTeam);
              }).map((csm) => {
                const csmClients = clients.filter(client => client.csm === csm);
                const backendStudents = csmClients.filter(client => 
                  client.type === 'Backend Student' || 
                  client.category === 'Backend Student'
                ).length;
                
                // Calculate team health metrics
                const clientsWithNPS = csmClients.filter(client => client.npsScore !== null);
                const avgNPS = clientsWithNPS.length > 0 
                  ? Math.round(clientsWithNPS.reduce((sum, client) => sum + (client.npsScore || 0), 0) / clientsWithNPS.length)
                  : 0;
                
                const mrrGrowth = csmClients.length > 0;
                const progressRate = csmClients.reduce((sum, client) => sum + client.progress, 0) / (csmClients.length || 1);
                
                // Determine health color based on NPS
                let healthColor = "text-green-600";
                let healthText = "Healthy";
                
                if (avgNPS < 6) {
                  healthColor = "text-red-600";
                  healthText = "At Risk";
                } else if (avgNPS >= 6 && avgNPS < 8) {
                  healthColor = "text-amber-600";
                  healthText = "Adequate";
                }
                
                return (
                  <TableRow key={csm}>
                    <TableCell className="font-medium">{csm}</TableCell>
                    <TableCell className="text-right">{csmClients.length}</TableCell>
                    <TableCell className="text-right">{backendStudents}</TableCell>
                    <TableCell className={`text-right font-medium ${healthColor}`}>
                      {healthText} (NPS: {avgNPS})
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
