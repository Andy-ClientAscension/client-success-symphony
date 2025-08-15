
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CSM_TEAMS, Client } from "@/lib/data";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  FileDown, 
  FileUp, 
  HelpCircle, 
  Edit, 
  Plus, 
  Filter,
  SortAsc,
  SortDesc,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HealthScoreEditor } from "./HealthScoreEditor";
import { HealthScoreHistory } from "./HealthScoreHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

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

type SortField = 'clientName' | 'team' | 'csm' | 'score' | 'date';
type SortDirection = 'asc' | 'desc';

// Enhanced color coding functions
const getScoreColorClass = (score: number) => {
  if (score < 5) return "text-red-600 dark:text-red-400";
  if (score < 7) return "text-orange-600 dark:text-orange-400";
  if (score < 8) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
};

const getScoreBgClass = (score: number) => {
  if (score < 5) return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
  if (score < 7) return "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800";
  if (score < 8) return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";
  return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
};

const getScoreLabel = (score: number) => {
  if (score < 5) return { label: "Critical", icon: AlertTriangle };
  if (score < 7) return { label: "At Risk", icon: TrendingDown };
  if (score < 8) return { label: "Healthy", icon: Minus };
  return { label: "Excellent", icon: TrendingUp };
};

// Enhanced health score badge component
const HealthScoreBadge = ({ score, previousScore, showLabel = false }: { 
  score: number; 
  previousScore?: number; 
  showLabel?: boolean;
}) => {
  const scoreInfo = getScoreLabel(score);
  const Icon = scoreInfo.icon;
  
  const trend = previousScore !== undefined ? (
    score > previousScore ? 'up' : score < previousScore ? 'down' : 'stable'
  ) : null;
  
  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1.5 rounded-lg border ${getScoreBgClass(score)} flex items-center gap-2`}>
        <Icon className={`h-4 w-4 ${getScoreColorClass(score)}`} />
        <span className={`font-bold text-lg ${getScoreColorClass(score)}`}>
          {score}/10
        </span>
        {showLabel && (
          <span className={`text-xs font-medium ${getScoreColorClass(score)}`}>
            {scoreInfo.label}
          </span>
        )}
      </div>
      {trend && (
        <div className="flex items-center">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          {trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
        </div>
      )}
    </div>
  );
};

export function HealthScoreSheet({ clients }: { clients: Client[] }) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [healthScores, setHealthScores] = useState<HealthScoreEntry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingScore, setEditingScore] = useState<HealthScoreEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"table" | "trends">("table");
  const { toast } = useToast();

  // Enhanced filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [csmFilter, setCsmFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique CSM list from clients
  const uniqueCsms = Array.from(new Set(clients.map(client => client.csm).filter(Boolean)));

  useEffect(() => {
    const storedScores = loadData<HealthScoreEntry[]>(STORAGE_KEYS.HEALTH_SCORES, []);
    setHealthScores(storedScores);
  }, []);

  // Enhanced filtering logic
  const filterScores = (scores: HealthScoreEntry[]) => {
    return scores.filter(score => {
      if (selectedTeam !== "all" && score.team !== selectedTeam) return false;
      
      if (searchTerm && !score.clientName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !score.team.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !score.csm.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Enhanced score filtering based on new color scheme
      if (scoreFilter === "excellent" && score.score < 8) return false;
      if (scoreFilter === "healthy" && (score.score < 7 || score.score >= 8)) return false;
      if (scoreFilter === "at-risk" && (score.score < 5 || score.score >= 7)) return false;
      if (scoreFilter === "critical" && score.score >= 5) return false;
      
      if (csmFilter !== "all" && score.csm !== csmFilter) return false;
      
      return true;
    });
  };

  const sortScores = (scores: HealthScoreEntry[]) => {
    return [...scores].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'clientName':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'team':
          comparison = a.team.localeCompare(b.team);
          break;
        case 'csm':
          comparison = a.csm.localeCompare(b.csm);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Process scores to get latest for each client
  const filteredScores = healthScores.reduce<Record<string, HealthScoreEntry[]>>(
    (acc, score) => {
      if (!acc[score.clientId]) {
        acc[score.clientId] = [];
      }
      acc[score.clientId].push(score);
      return acc;
    },
    {}
  );

  const latestScores = Object.values(filteredScores).map(scores => {
    const sortedScores = [...scores].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latest = sortedScores[0];
    if (sortedScores.length > 1) {
      latest.previousScore = sortedScores[1].score;
    }
    return latest;
  });

  const filteredAndSortedScores = sortScores(filterScores(latestScores));

  // Calculate summary statistics
  const summaryStats = {
    total: filteredAndSortedScores.length,
    excellent: filteredAndSortedScores.filter(s => s.score >= 8).length,
    healthy: filteredAndSortedScores.filter(s => s.score >= 7 && s.score < 8).length,
    atRisk: filteredAndSortedScores.filter(s => s.score >= 5 && s.score < 7).length,
    critical: filteredAndSortedScores.filter(s => s.score < 5).length,
    average: filteredAndSortedScores.length > 0 
      ? filteredAndSortedScores.reduce((sum, score) => sum + score.score, 0) / filteredAndSortedScores.length
      : 0
  };

  // Get clients without scores
  const clientsWithoutScores = clients
    .filter(client => {
      if (selectedTeam !== "all" && client.team !== selectedTeam) return false;
      if (csmFilter !== "all" && client.csm !== csmFilter) return false;
      if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return !healthScores.some(score => score.clientId === client.id);
    });

  const handleExportCsv = () => {
    const headers = ["Client Name", "Team", "CSM", "Health Score", "Status", "Notes", "Date"];
    const csvRows = [headers];
    
    filteredAndSortedScores.forEach(score => {
      csvRows.push([
        score.clientName,
        score.team,
        score.csm,
        score.score.toString(),
        getScoreLabel(score.score).label,
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

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection(field === 'score' ? 'desc' : 'asc'); // Default to desc for scores
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="inline h-4 w-4 ml-1" /> : 
      <ChevronDown className="inline h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Excellent (8-10)</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.excellent}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk (&lt;7)</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.atRisk + summaryStats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{summaryStats.average.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={summaryStats.average * 10} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Health Score Table */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-bold">Health Score Dashboard</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4">
                    <div className="space-y-2">
                      <p className="font-medium">Health Score Color Coding:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Critical (0-4): Immediate attention required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded"></div>
                          <span>At Risk (5-6): Needs improvement</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span>Healthy (7): Good condition</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Excellent (8-10): Outstanding performance</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {CSM_TEAMS.filter(team => team.id !== "all").map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportCsv}>
                <FileDown className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "table" | "trends")}>
            <TabsList className="mb-6">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Health Score Table
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Score Trends
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="space-y-4">
              {/* Enhanced Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search clients, teams, or CSMs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[140px]">
                        <Filter className="h-4 w-4 mr-2" /> 
                        Score: {scoreFilter === 'all' ? 'All' : 
                                scoreFilter === 'excellent' ? 'Excellent' : 
                                scoreFilter === 'healthy' ? 'Healthy' : 
                                scoreFilter === 'at-risk' ? 'At Risk' : 'Critical'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setScoreFilter('all')}>
                        All Scores
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setScoreFilter('excellent')}>
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" /> Excellent (8-10)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setScoreFilter('healthy')}>
                        <Minus className="h-4 w-4 mr-2 text-yellow-600" /> Healthy (7)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setScoreFilter('at-risk')}>
                        <TrendingDown className="h-4 w-4 mr-2 text-orange-600" /> At Risk (5-6)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setScoreFilter('critical')}>
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-600" /> Critical (0-4)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Select value={csmFilter} onValueChange={setCsmFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by CSM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All CSMs</SelectItem>
                      {uniqueCsms.map((csm) => (
                        <SelectItem key={csm} value={csm}>{csm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Data Table */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors" 
                        onClick={() => handleSort('clientName')}
                      >
                        <div className="flex items-center">
                          Client {renderSortIcon('clientName')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleSort('team')}
                      >
                        <div className="flex items-center">
                          Team {renderSortIcon('team')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleSort('csm')}
                      >
                        <div className="flex items-center">
                          CSM {renderSortIcon('csm')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleSort('score')}
                      >
                        <div className="flex items-center">
                          Health Score {renderSortIcon('score')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Last Updated {renderSortIcon('date')}
                        </div>
                      </TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedScores.length > 0 ? (
                      filteredAndSortedScores.map((score) => (
                        <TableRow key={score.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">{score.clientName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{score.team}</Badge>
                          </TableCell>
                          <TableCell>{score.csm}</TableCell>
                          <TableCell>
                            <HealthScoreBadge 
                              score={score.score} 
                              previousScore={score.previousScore}
                              showLabel
                            />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {score.date ? format(new Date(score.date), "MMM dd, yyyy") : "Not recorded"}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="truncate text-sm">
                              {score.notes || <span className="text-muted-foreground">No notes</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditHealthScore(score)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <BarChart3 className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No health scores found</p>
                            <p className="text-sm text-muted-foreground">
                              Health scores are recorded during bi-weekly client notes
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {/* Clients without scores */}
                    {clientsWithoutScores.map((client) => (
                      <TableRow key={`no-score-${client.id}`} className="bg-muted/20 hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.team}</Badge>
                        </TableCell>
                        <TableCell>{client.csm}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-muted-foreground">
                            Not recorded
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAddHealthScore(client)}
                            className="hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="trends">
              <HealthScoreHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Health Score Editor Modal */}
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
    </div>
  );
}
