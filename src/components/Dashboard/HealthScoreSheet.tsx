import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CSM_TEAMS, Client } from "@/lib/data";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileUp, HelpCircle, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HealthScoreEditor } from "./HealthScoreEditor";
import { HealthScoreHistory } from "./HealthScoreHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingScore, setEditingScore] = useState<HealthScoreEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"table" | "trends">("table");
  const { toast } = useToast();

  useEffect(() => {
    const storedScores = loadData<HealthScoreEntry[]>(STORAGE_KEYS.HEALTH_SCORES, []);
    setHealthScores(storedScores);
  }, []);

  const filteredScores = selectedTeam === "all" 
    ? healthScores 
    : healthScores.filter(score => score.team === selectedTeam);

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

  const latestScores = Object.values(scoresByClient).map(scores => {
    const sortedScores = [...scores].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latest = sortedScores[0];
    if (sortedScores.length > 1) {
      latest.previousScore = sortedScores[1].score;
    }
    return latest;
  });

  const sortedLatestScores = latestScores.sort((a, b) => 
    a.clientName.localeCompare(b.clientName)
  );

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
    const headers = ["Client Name", "Team", "CSM", "Health Score", "Notes", "Date"];
    const csvRows = [headers];
    
    sortedLatestScores.forEach(score => {
      csvRows.push([
        score.clientName,
        score.team,
        score.csm,
        score.score.toString(),
        score.notes.replace(/,/g, ";"),
        format(new Date(score.date), "yyyy-MM-dd")
      ]);
    });
    
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    
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
    toast({
      title: "Import Feature",
      description: "CSV import functionality will be available in a future update",
    });
  };

  const handleAddHealthScore = (client: Client) => {
    setSelectedClient(client);
    setEditingScore(null);
    setIsEditorOpen(true);
  };

  const handleEditHealthScore = (score: HealthScoreEntry) => {
    const client = clients.find(c => c.id === score.clientId);
    if (client) {
      setSelectedClient(client);
      setEditingScore(score);
      setIsEditorOpen(true);
    }
  };

  const handleEditorSubmit = () => {
    const updatedScores = loadData<HealthScoreEntry[]>(STORAGE_KEYS.HEALTH_SCORES, []);
    setHealthScores(updatedScores);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };

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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "table" | "trends")} className="mb-6">
          <TabsList>
            <TabsTrigger value="table">Data Table</TabsTrigger>
            <TabsTrigger value="trends">Score Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-4">
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
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditHealthScore(score)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        No health scores found for {selectedTeam === "all" ? "any team" : selectedTeam}.
                        <p className="text-sm text-muted-foreground mt-1">
                          Health scores are recorded in bi-weekly notes for each client.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                  
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
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const actualClient = clients.find(c => c.id === client.clientId);
                            if (actualClient) {
                              handleAddHealthScore(actualClient);
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-4">
            {selectedClient ? (
              <HealthScoreHistory 
                clientId={selectedClient.id} 
                clientName={selectedClient.name} 
              />
            ) : (
              <HealthScoreHistory />
            )}
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedLatestScores.slice(0, 4).map((score) => (
                <Card 
                  key={score.id} 
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => {
                    const client = clients.find(c => c.id === score.clientId);
                    if (client) {
                      setSelectedClient(client);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{score.clientName}</h3>
                      <span className={`font-bold ${getScoreColor(score.score)}`}>{score.score}/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {score.date ? format(new Date(score.date), "MMM dd, yyyy") : "Not recorded"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {selectedClient && (
        <HealthScoreEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSubmit={handleEditorSubmit}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          team={selectedClient.team || ""}
          csm={selectedClient.csm || "Unassigned"}
          initialData={editingScore ? {
            id: editingScore.id,
            score: editingScore.score,
            notes: editingScore.notes
          } : undefined}
        />
      )}
    </Card>
  );
}
