
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { StatisticsCards } from "./StatisticsCards";
import { ClientTable } from "./ClientTable";
import { ChurnReasons } from "./ChurnReasons";
import { TeamFilter } from "./TeamFilter";
import { useRealtimeData } from "@/utils/dataSyncService";

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
  const [backEndSales] = useRealtimeData<BackEndSale[]>(STORAGE_KEYS.CHURN, []);
  
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
        <TeamFilter 
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          teams={teams}
          formatTeamName={formatTeamName}
        />
      </div>
      
      <StatisticsCards 
        renewedClients={renewedClients}
        churnedClients={churnedClients}
        renewalRate={renewalRate}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Client Renewal Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientTable 
            filteredSales={filteredSales}
            formatTeamName={formatTeamName}
          />
        </CardContent>
      </Card>
      
      <ChurnReasons topChurnReasons={topChurnReasons} />
    </div>
  );
}
