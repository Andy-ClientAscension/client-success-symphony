
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ThumbsUp, ThumbsDown, PieChart } from "lucide-react";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";

interface BackEndSale {
  id: string;
  clientId: string;
  clientName: string;
  status: "renewed" | "churned";
  renewalDate: Date | string;
  notes: string;
  painPoints: string[];
  team?: string;
}

export function RenewalsSummary() {
  const [selectedTeam, setSelectedTeam] = useState("all");
  const backEndSales = loadData<BackEndSale[]>(STORAGE_KEYS.CHURN, []);
  
  // Get unique teams
  const teams = useMemo(() => {
    const uniqueTeams = new Set<string>();
    backEndSales.forEach(sale => {
      if (sale.team) {
        uniqueTeams.add(sale.team);
      }
    });
    return ["all", ...Array.from(uniqueTeams)];
  }, [backEndSales]);
  
  // Filter sales by team
  const filteredSales = useMemo(() => {
    return selectedTeam === "all" 
      ? backEndSales 
      : backEndSales.filter(sale => sale.team === selectedTeam);
  }, [backEndSales, selectedTeam]);
  
  // Calculate statistics
  const totalClients = filteredSales.length;
  const renewedClients = filteredSales.filter(sale => sale.status === "renewed").length;
  const churnedClients = filteredSales.filter(sale => sale.status === "churned").length;
  const renewalRate = totalClients > 0 ? (renewedClients / totalClients) * 100 : 0;
  
  // Get top 3 churn reasons across filtered sales
  const topChurnReasons = useMemo(() => {
    const reasons: Record<string, number> = {};
    
    filteredSales
      .filter(sale => sale.status === "churned")
      .forEach(sale => {
        sale.painPoints.forEach(point => {
          reasons[point] = (reasons[point] || 0) + 1;
        });
      });
    
    return Object.entries(reasons)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3);
  }, [filteredSales]);

  // Format team name for display
  const formatTeamName = (team: string): string => {
    if (team === "all") return "All Teams";
    if (team.startsWith("Team-")) {
      return "Team " + team.substring(5);
    }
    return team;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Backend Sales Summary</h2>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {formatTeamName(team)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ThumbsUp className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-lg font-semibold">{renewedClients}</p>
              <p className="text-sm text-muted-foreground">Renewed Clients</p>
            </div>
          </CardContent>
        </Card>
            
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ThumbsDown className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-lg font-semibold">{churnedClients}</p>
              <p className="text-sm text-muted-foreground">Churned Clients</p>
            </div>
          </CardContent>
        </Card>
            
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <PieChart className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-lg font-semibold">{renewalRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Renewal Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Renewal Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Churn Reasons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.clientName}</TableCell>
                    <TableCell>{sale.team ? formatTeamName(sale.team) : "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={sale.status === "renewed" ? "outline" : "destructive"}
                      >
                        {sale.status === "renewed" ? "Renewed" : "Churned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sale.status === "churned" && sale.painPoints.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sale.painPoints.map((point, index) => (
                            <Badge key={`${sale.id}-reason-${index}`} variant="outline" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                              {point}
                            </Badge>
                          ))}
                        </div>
                      ) : sale.status === "churned" ? (
                        <span className="text-muted-foreground text-sm">No reasons provided</span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No clients found for the selected filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {topChurnReasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Churn Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topChurnReasons.map(([reason, count], index) => (
                <li key={`top-reason-${index}`} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <span className="font-medium">{reason}</span>
                  <Badge variant="outline">{count} {count === 1 ? 'client' : 'clients'}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
