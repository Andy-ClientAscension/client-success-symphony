
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CSM_TEAMS, Client } from "@/lib/data";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileUp, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HealthScoreEntry {
  id: string;
  clientId: string;
  clientName: string;
  team: string;
  csm: string;
  score: number;
  notes: string;
  date: string;
  previousScore?: number;
}

export function HealthScoreSheet({ clients }: { clients: Client[] }) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [healthScores, setHealthScores] = useState<HealthScoreEntry[]>([]);
  const { toast } = useToast();

  // Load health scores from storage
  useEffect(() => {
    const storedScores = loadData<HealthScoreEntry[]>(STORAGE_KEYS.HEALTH_SCORES, []);
    setHealthScores(storedScores);
  }, []);

  // Get filtered scores based on selected team
  const filteredScores = selectedTeam === "all" 
    ? healthScores 
    : healthScores.filter(score => score.team === selectedTeam);

  // Group scores by client for the selected team
  const scoresByClient = filteredScores.reduce<Record<string, HealthScoreEntry[]>>(
    (acc, score) => {
      if (!acc[score.clientId]) {
        acc[score.clientId] = [];
      }
      acc[score.clientId].push(score);
      return acc;
    },
    {}
  );

  // Get the latest health score for each client
  const latestScores = Object.values(scoresByClient).map(scores => {
    // Sort by date, newest first
    const sortedScores = [...scores].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latest = sortedScores[0];
    // If there's more than one score, set the previous score
    if (sortedScores.length > 1) {
      latest.previousScore = sortedScores[1].score;
    }
    return latest;
  });

  // Sort by client name
  const sortedLatestScores = latestScores.sort((a, b) => 
    a.clientName.localeCompare(b.clientName)
  );

  // Find clients without health scores and add placeholder entries
  const clientsWithoutScores = clients
    .filter(client => {
      if (selectedTeam !== "all" && client.team !== selectedTeam) return false;
      return !healthScores.some(score => score.clientId === client.id);
    })
    .map(client => ({
      id: `placeholder-${client.id}`,
      clientId: client.id,
      clientName: client.name,
      team: client.team || "",
      csm: client.csm || "",
      score: 0,
      notes: "",
      date: "",
      isPlaceholder: true
    }));

  const handleExportCsv = () => {
    // Create CSV data
    const headers = ["Client Name", "Team", "CSM", "Health Score", "Notes", "Date"];
    const csvRows = [headers];
    
    sortedLatestScores.forEach(score => {
      csvRows.push([
        score.clientName,
        score.team,
        score.csm,
        score.score.toString(),
        score.notes.replace(/,/g, ";"), // Replace commas to avoid CSV issues
        format(new Date(score.date), "yyyy-MM-dd")
      ]);
    });
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `health-scores-${selectedTeam}-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Health scores have been exported to CSV",
    });
  };

  const handleImportCsv = () => {
    // Placeholder for future CSV import functionality
    toast({
      title: "Import Feature",
      description: "CSV import functionality will be available in a future update",
    });
  };

  // Helper to get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };

  // Helper to get trend indicator
  const getTrendIndicator = (current: number, previous?: number) => {
    if (previous === undefined) return null;
    
    if (current > previous) return <span className="text-green-500">↑</span>;
    if (current < previous) return <span className="text-red-500">↓</span>;
    return <span className="text-gray-500">→</span>;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Health Score Sheet</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <p className="text-xs">
                    This sheet tracks client health scores across all teams. 
                    Health scores range from 1 (poor) to 10 (excellent) and are 
                    gathered during bi-weekly notes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {CSM_TEAMS.filter(team => team.id !== "all").map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs" 
              onClick={handleExportCsv}
            >
              <FileDown className="h-3 w-3 mr-1" /> Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs" 
              onClick={handleImportCsv}
            >
              <FileUp className="h-3 w-3 mr-1" /> Import
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="border rounded-lg overflow-hidden bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[200px]">Client</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>CSM</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLatestScores.length > 0 ? (
                sortedLatestScores.map((score) => (
                  <TableRow key={score.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{score.clientName}</TableCell>
                    <TableCell>{score.team}</TableCell>
                    <TableCell>{score.csm}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${getScoreColor(score.score)}`}>
                          {score.score}/10
                        </span>
                        {getTrendIndicator(score.score, score.previousScore)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {score.date ? format(new Date(score.date), "MMM dd, yyyy") : "Not yet recorded"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {score.notes || "No notes"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    No health scores found for {selectedTeam === "all" ? "any team" : selectedTeam}.
                    <p className="text-sm text-muted-foreground mt-1">
                      Health scores are recorded in bi-weekly notes for each client.
                    </p>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Show clients without scores */}
              {clientsWithoutScores.map((client) => (
                <TableRow key={client.id} className="hover:bg-gray-50 bg-gray-50/30">
                  <TableCell className="font-medium">{client.clientName}</TableCell>
                  <TableCell>{client.team}</TableCell>
                  <TableCell>{client.csm}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Not recorded</Badge>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
