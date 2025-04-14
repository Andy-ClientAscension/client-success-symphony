import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, ThumbsUp, ThumbsDown, PieChart, BarChart3, Users, Award, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { getAllClients } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { saveData, loadData, STORAGE_KEYS } from "@/utils/persistence";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BackEndSalesForm } from "./BackEndSalesForm";

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

interface ChurnNotesFormData {
  notes: string;
  painPoints: string;
}

interface TeamPerformance {
  name: string;
  totalClients: number;
  renewedClients: number;
  churnedClients: number;
  renewalRate: number;
  trend: number;
}

const DEFAULT_TEAM_DATA: TeamPerformance[] = [
  { name: "Team Andy", totalClients: 12, renewedClients: 10, churnedClients: 2, renewalRate: 83.3, trend: 5 },
  { name: "Team Chris", totalClients: 15, renewedClients: 11, churnedClients: 4, renewalRate: 73.3, trend: -3 },
  { name: "Team Alex", totalClients: 10, renewedClients: 8, churnedClients: 2, renewalRate: 80.0, trend: 2 },
  { name: "Team Cillin", totalClients: 9, renewedClients: 6, churnedClients: 3, renewalRate: 66.7, trend: -1 },
  { name: "Enterprise", totalClients: 7, renewedClients: 6, churnedClients: 1, renewalRate: 85.7, trend: 7 },
  { name: "SMB", totalClients: 18, renewedClients: 12, churnedClients: 6, renewalRate: 66.7, trend: -2 }
];

const COMMON_PAIN_POINTS = [
  "Price too high",
  "Not seeing value",
  "Changed business needs",
  "Competitor offering",
  "Poor support experience",
  "Missing features",
  "Technical issues",
  "Internal reorganization"
];

export function BackEndSalesTracker() {
  const [backEndSales, setBackEndSales] = useState<BackEndSale[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState("sales");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ChurnNotesFormData>({
    defaultValues: {
      notes: "",
      painPoints: ""
    },
  });
  
  const allClients = useMemo(() => getAllClients(), []);
  
  const teams = useMemo(() => {
    const uniqueTeams = new Set<string>();
    allClients.forEach(client => {
      if (client.team) {
        uniqueTeams.add(client.team);
      }
    });
    return ["all", ...Array.from(uniqueTeams)];
  }, [allClients]);
  
  useEffect(() => {
    const savedSales = loadData<BackEndSale[]>(STORAGE_KEYS.CHURN, []);
    
    if (savedSales.length === 0) {
      const today = new Date();
      const mockSales: BackEndSale[] = allClients.slice(0, 30).map(client => {
        const status = Math.random() > 0.3 ? "renewed" : "churned";
        const randomDays = Math.floor(Math.random() * 90);
        const renewalDate = new Date(today);
        renewalDate.setDate(renewalDate.getDate() - randomDays);
        
        const randomPainPoints = COMMON_PAIN_POINTS
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 3) + 1);
        
        return {
          id: `bsale-${client.id}`,
          clientId: client.id,
          clientName: client.name,
          status,
          renewalDate,
          notes: status === "churned" ? "Client decided not to continue." : "",
          painPoints: status === "churned" ? randomPainPoints : [],
          team: client.team
        };
      });
      
      setBackEndSales(mockSales);
      saveData(STORAGE_KEYS.CHURN, mockSales);
    } else {
      try {
        const processedSales = savedSales.map(sale => {
          let renewalDate: Date;
          
          if (typeof sale.renewalDate === 'string') {
            try {
              renewalDate = parseISO(sale.renewalDate);
              if (!isValid(renewalDate)) {
                renewalDate = new Date();
              }
            } catch (e) {
              renewalDate = new Date();
            }
          } else {
            renewalDate = new Date(sale.renewalDate);
            if (!isValid(renewalDate)) {
              renewalDate = new Date();
            }
          }
          
          const client = allClients.find(c => c.id === sale.clientId);
          const team = sale.team || (client ? client.team : undefined);
          
          return {
            ...sale,
            renewalDate,
            team
          };
        });
        
        setBackEndSales(processedSales);
      } catch (error) {
        console.error("Error processing saved sales data:", error);
        setBackEndSales([]);
        saveData(STORAGE_KEYS.CHURN, []);
      }
    }
  }, [allClients]);
  
  const filteredByTeam = useMemo(() => {
    return selectedTeam === "all" 
      ? backEndSales 
      : backEndSales.filter(sale => sale.team === selectedTeam);
  }, [backEndSales, selectedTeam]);
  
  const filteredSales = useMemo(() => {
    return activeTab === "all" 
      ? filteredByTeam 
      : filteredByTeam.filter(sale => sale.status === activeTab);
  }, [filteredByTeam, activeTab]);
  
  const teamPerformance = useMemo(() => {
    const teamStats: Record<string, TeamPerformance> = {};
    
    const allTeams = new Set([...teams.filter(team => team !== "all")]);
    
    allTeams.forEach(team => {
      teamStats[team] = {
        name: team,
        totalClients: 0,
        renewedClients: 0,
        churnedClients: 0,
        renewalRate: 0,
        trend: Math.floor(Math.random() * 20) - 10
      };
    });
    
    backEndSales.forEach(sale => {
      if (sale.team && sale.team !== "all" && teamStats[sale.team]) {
        teamStats[sale.team].totalClients++;
        if (sale.status === "renewed") {
          teamStats[sale.team].renewedClients++;
        } else {
          teamStats[sale.team].churnedClients++;
        }
      }
    });
    
    Object.keys(teamStats).forEach(team => {
      const stats = teamStats[team];
      stats.renewalRate = stats.totalClients > 0 
        ? (stats.renewedClients / stats.totalClients) * 100 
        : 0;
    });
    
    let teamPerformanceList = Object.values(teamStats);
    
    if (teamPerformanceList.length === 0) {
      teamPerformanceList = [...DEFAULT_TEAM_DATA];
    }
    
    return teamPerformanceList.sort((a, b) => b.renewalRate - a.renewalRate);
  }, [backEndSales, teams]);
  
  const totalClients = filteredByTeam.length;
  const renewedClients = filteredByTeam.filter(sale => sale.status === "renewed").length;
  const churnedClients = filteredByTeam.filter(sale => sale.status === "churned").length;
  const renewalRate = totalClients > 0 ? (renewedClients / totalClients) * 100 : 0;

  const handleNotesSubmit = (data: ChurnNotesFormData) => {
    if (!selectedClient) return;
    
    const updatedSales = backEndSales.map(sale => {
      if (sale.clientId === selectedClient) {
        const updatedSale = {
          ...sale,
          notes: data.notes,
          painPoints: data.painPoints.split(',').map(point => point.trim()).filter(Boolean)
        };
        return updatedSale;
      }
      return sale;
    });
    
    setBackEndSales(updatedSales);
    saveData(STORAGE_KEYS.CHURN, updatedSales);
    
    toast({
      title: "Notes Updated",
      description: "Client churn notes have been saved successfully",
    });
    
    form.reset();
    setSelectedClient(null);
  };
  
  const handleSelectClient = (clientId: string) => {
    const client = backEndSales.find(sale => sale.clientId === clientId);
    if (client) {
      setSelectedClient(clientId);
      form.setValue("notes", client.notes);
      form.setValue("painPoints", client.painPoints.join(", "));
    }
  };

  const formatDate = (date: Date | string): string => {
    if (!date) {
      return "Invalid date";
    }
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) {
        return "Invalid date";
      }
      return format(dateObj, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getTeamChurnReasons = (teamName: string) => {
    const teamSales = backEndSales.filter(sale => 
      sale.team === teamName && sale.status === "churned");
    
    if (teamSales.length > 0) {
      const painPoints: Record<string, number> = {};
      teamSales.forEach(sale => {
        sale.painPoints.forEach(point => {
          painPoints[point] = (painPoints[point] || 0) + 1;
        });
      });
      
      return Object.entries(painPoints)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3);
    }
    
    return COMMON_PAIN_POINTS
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(point => [point, Math.floor(Math.random() * 5) + 1]);
  };

  const handleAddNewSale = (data: any) => {
    const newSale: BackEndSale = {
      id: `bsale-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      status: data.status,
      renewalDate: data.renewalDate,
      notes: data.notes,
      painPoints: data.status === "churned" ? [] : [],
      team: data.team
    };
    
    const updatedSales = [...backEndSales, newSale];
    setBackEndSales(updatedSales);
    saveData(STORAGE_KEYS.CHURN, updatedSales);
    
    toast({
      title: "Client Added",
      description: `${data.clientName} has been added to the Back End Sales Tracker.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Back End Sales Tracking
            </CardTitle>
            <CardDescription>
              Track client renewals, churn, and identify pain points to improve retention
            </CardDescription>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Client
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-6">
          <TabsList>
            <TabsTrigger value="sales">Client Sales</TabsTrigger>
            <TabsTrigger value="teams">Team Performance</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <TabsContent value="sales" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="flex gap-2">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All</TabsTrigger>
                <TabsTrigger value="renewed" onClick={() => setActiveTab("renewed")}>Renewed</TabsTrigger>
                <TabsTrigger value="churned" onClick={() => setActiveTab("churned")}>Churned</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.filter(team => team !== "all").map((team) => (
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.clientName}</TableCell>
                        <TableCell>{sale.team || "Unassigned"}</TableCell>
                        <TableCell>{formatDate(sale.renewalDate)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={sale.status === "renewed" ? "outline" : "destructive"}
                          >
                            {sale.status === "renewed" ? "Renewed" : "Churned"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sale.status === "churned" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSelectClient(sale.clientId)}
                              disabled={selectedClient === sale.clientId}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              {sale.notes ? "Edit Notes" : "Add Notes"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No clients found for the selected filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div>
              {selectedClient && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Churn Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleNotesSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Why did the client churn?</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter detailed notes about why the client churned..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="painPoints"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pain Points (comma separated)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Price too high, Not seeing value, etc..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" type="button" onClick={() => setSelectedClient(null)}>
                            Cancel
                          </Button>
                          <Button type="submit">Save Notes</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {!selectedClient && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <PieChart className="h-4 w-4 mr-2" />
                      {selectedTeam === 'all' ? 'Overall Stats' : `${selectedTeam} Stats`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Renewal Rate</span>
                          <span className="font-medium">{renewalRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={renewalRate} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div className="text-muted-foreground">Total Clients</div>
                          <div className="font-medium">{totalClients}</div>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
                          <div className="text-muted-foreground">Renewed</div>
                          <div className="font-medium text-green-600 dark:text-green-400">{renewedClients}</div>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-md">
                          <div className="text-muted-foreground">Churned</div>
                          <div className="font-medium text-red-600 dark:text-red-400">{churnedClients}</div>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-md">
                          <div className="text-muted-foreground">Churn Rate</div>
                          <div className="font-medium text-amber-600 dark:text-amber-400">
                            {totalClients > 0 ? (100 - renewalRate).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="teams" className="mt-0 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Team Performance Overview
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Award className="h-8 w-8 text-indigo-500 mb-2" />
                  <p className="text-lg font-semibold">
                    {teamPerformance.length > 0 ? teamPerformance[0].name : "Team Andy"}
                  </p>
                  <p className="text-sm text-muted-foreground">Best Performing Team</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <PieChart className="h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-lg font-semibold">
                    {teamPerformance.length > 0 ? 
                      `${teamPerformance[0].renewalRate.toFixed(1)}%` : 
                      "80.0%"}
                  </p>
                  <p className="text-sm text-muted-foreground">Top Renewal Rate</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <ThumbsDown className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-lg font-semibold">
                    {teamPerformance.length > 0 && teamPerformance.length > 1 ? 
                      teamPerformance[teamPerformance.length-1].name : 
                      "Team Chris"}
                  </p>
                  <p className="text-sm text-muted-foreground">Needs Improvement</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Team Renewal Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Renewed</TableHead>
                    <TableHead>Churned</TableHead>
                    <TableHead>Renewal Rate</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamPerformance.length > 0 ? (
                    teamPerformance.map((team, index) => (
                      <TableRow key={`team-performance-${team.name}-${index}`}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.totalClients}</TableCell>
                        <TableCell className="text-green-600">{team.renewedClients}</TableCell>
                        <TableCell className="text-red-600">{team.churnedClients}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={team.renewalRate} className="h-2 w-24" />
                            <span className={team.renewalRate > 75 
                              ? "text-green-600" 
                              : team.renewalRate > 50 
                              ? "text-amber-600" 
                              : "text-red-600"}>
                              {team.renewalRate.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {team.trend > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : team.trend < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            ) : (
                              "→"
                            )}
                            <span className={team.trend > 0 
                              ? "text-green-600" 
                              : team.trend < 0 
                              ? "text-red-600" 
                              : ""}>
                              {team.trend > 0 ? "+" : ""}{team.trend}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No team performance data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Common Churn Reasons by Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamPerformance.slice(0, 4).map((team, teamIndex) => {
                  const churnReasons = getTeamChurnReasons(team.name);
                  
                  return (
                    <div key={`team-churn-${team.name}-${teamIndex}`} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">{team.name}</h4>
                      {churnReasons.length > 0 ? (
                        <ul className="space-y-2">
                          {churnReasons.map(([point, count], index) => (
                            <li key={`${team.name}-${point}-${index}`} className="text-sm flex justify-between">
                              <span>{point}</span>
                              <span className="text-amber-600">{count} {count === 1 ? 'client' : 'clients'}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No churn data available</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </CardContent>

      {showAddForm && (
        <BackEndSalesForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddNewSale}
          teams={teams.filter(team => team !== "all")}
        />
      )}
    </Card>
  );
}
