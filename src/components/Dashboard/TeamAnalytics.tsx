import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientMetricsByTeam, getAllClients, getCSMList } from "@/lib/data";
import { CheckCircle2, AlertTriangle, ArrowDownRight, Users, TrendingUp, TrendingDown, PlusCircle, Trash2, Minus } from "lucide-react";
import { TeamMetricCard } from "./TeamMetricCard";
import { TeamStatusMetric } from "./TeamStatusMetric";
import { SSCPerformanceTable } from "./SSCPerformanceTable";
import { HealthScoreSheet } from "./HealthScoreSheet";
import { HealthScoreHistory } from "./HealthScoreHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TeamManagementDialog } from "./TeamManagementDialog";
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const ADDITIONAL_TEAMS = [
  { id: "Enterprise", name: "Enterprise" },
  { id: "SMB", name: "SMB" },
  { id: "Mid-Market", name: "Mid Market" },
];

interface TeamAnalyticsProps {
  selectedTeam?: string;
  dateRange?: string;
  searchQuery?: string;
}

type DashboardSectionKey = "metrics" | "client-status" | "performance" | "health-scores" | "health-trends";
const defaultSections: { key: DashboardSectionKey; label: string }[] = [
  { key: "metrics", label: "Key Metrics Overview" },
  { key: "client-status", label: "Client Status Metrics" },
  { key: "performance", label: "Team Performance" },
  { key: "health-scores", label: "Health Score Sheet" },
  { key: "health-trends", label: "Health Trends" },
];

export function TeamAnalytics({ 
  selectedTeam: externalSelectedTeam, 
  dateRange: externalDateRange,
  searchQuery: externalSearchQuery 
}: TeamAnalyticsProps = {}) {
  const [selectedTeam, setSelectedTeam] = useState<string>(externalSelectedTeam || "all");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [teams, setTeams] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'add' | 'delete'>('add');
  const { toast } = useToast();
  
  const [dateRange] = useState(externalDateRange || "Last 30 days");
  const [searchQuery] = useState(externalSearchQuery || "");
  
  const clients = useMemo(() => getAllClients(), []);
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [sectionStates, setSectionStates] = useState<{ key: DashboardSectionKey; visible: boolean }[]>(
    defaultSections.map(s => ({ key: s.key, visible: true }))
  );
  const [sectionOrder, setSectionOrder] = useState<DashboardSectionKey[]>(defaultSections.map(s => s.key));
  
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
  
  useEffect(() => {
    if (externalSelectedTeam) {
      setSelectedTeam(externalSelectedTeam);
    }
  }, [externalSelectedTeam]);
  
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

  const handleToggleSection = (key: DashboardSectionKey) => {
    setSectionStates(prev =>
      prev.map(s =>
        s.key === key ? { ...s, visible: !s.visible } : s
      )
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(sectionOrder);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSectionOrder(reordered);
  };

  const handleShowOnboarding = () => setShowOnboarding(true);
  const handleHideOnboarding = () => setShowOnboarding(false);

  const SectionComponents = {
    metrics: (
      <Card className="rounded-xl bg-background/60 p-2 md:p-8 mb-8 shadow-inner whitespace-pre-line">
        <Collapsible defaultOpen={false}>
          <div className="flex items-center justify-between pb-4">
            <span className="text-base font-semibold">Key Metrics Overview</span>
            <CollapsibleTrigger asChild>
              <button className="flex items-center text-xs font-medium space-x-1 rounded px-2 py-1 hover:bg-muted transition">
                <span>Show Details</span>
                <Plus className="h-4 w-4" />
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-6 mt-4">
              <TeamMetricCard title="Total MRR" value={`$${teamMetrics.totalMRR}`} trend={8} />
              <TeamMetricCard title="Calls Booked" value={teamMetrics.totalCallsBooked} trend={12} />
              <TeamMetricCard title="Deals Closed" value={teamMetrics.totalDealsClosed} trend={5} />
              <TeamMetricCard title="Client Count" value={statusCounts.total} trend={3} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    ),
    "client-status": (
      <Card className="rounded-xl bg-background/60 p-2 md:p-8 mb-8 shadow-inner whitespace-pre-line">
        <Collapsible defaultOpen={false}>
          <div className="flex items-center justify-between pb-4">
            <span className="text-base font-semibold">Client Status Metrics</span>
            <CollapsibleTrigger asChild>
              <button className="flex items-center text-xs font-medium space-x-1 rounded px-2 py-1 hover:bg-muted transition">
                <span>Show Details</span>
                <Plus className="h-4 w-4" />
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-2 mt-4">
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
          </CollapsibleContent>
        </Collapsible>
      </Card>
    ),
    performance: (
      <Card className="rounded-xl bg-background/60 p-2 md:p-8 mb-8 shadow-inner whitespace-pre-line">
        <div>
          <SSCPerformanceTable 
            csmList={csmList}
            clients={clients}
            selectedTeam={selectedTeam}
          />
        </div>
      </Card>
    ),
    "health-scores": (
      <Card className="rounded-xl bg-background/60 p-2 md:p-8 mb-8 shadow-inner whitespace-pre-line">
        <HealthScoreSheet clients={teamClients} />
      </Card>
    ),
    "health-trends": (
      <Card className="rounded-xl bg-background/60 p-2 md:p-8 mb-8 shadow-inner whitespace-pre-line">
        <HealthScoreHistory />
      </Card>
    ),
  };

  const handleAddTeam = () => {
    setDialogAction('add');
    setDialogOpen(true);
  };

  const handleDeleteTeam = () => {
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
  };

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

  return (
    <div className="relative">
      {showOnboarding && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 max-w-lg w-full rounded-2xl shadow-xl px-8 py-12 flex flex-col items-center space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">Build Your Own Dashboard</h2>
            <p className="text-base text-gray-600 dark:text-gray-200 mb-4 text-center">
              🎯 Pick which analytics sections are most important to you.<br/>
              Use drag-and-drop to arrange them, and hide ones you don't want.<br/>
              You can always customize later!
            </p>
            {sectionOrder.map((sectionKey, index) => {
              const secLabel = defaultSections.find(s => s.key === sectionKey)?.label || sectionKey;
              const isVisible = sectionStates.find(s => s.key === sectionKey)?.visible ?? true;
              return (
                <div
                  key={sectionKey}
                  className="flex items-center justify-between px-2 w-full mb-2"
                >
                  <span>{secLabel}</span>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => handleToggleSection(sectionKey)}
                  />
                </div>
              );
            })}
            <div className="w-full flex justify-end">
              <Button onClick={handleHideOnboarding}>Done</Button>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-sm mx-auto max-w-6xl px-2 md:px-12">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold">Team Analytics</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
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
              <Button size="sm" variant="outline" onClick={handleAddTeam} className="h-8">
                <PlusCircle className="h-4 w-4 mr-1" /> Add Team
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeleteTeam} className="h-8">
                <Trash2 className="h-4 w-4 mr-1" /> Delete Team
              </Button>
              <Button size="sm" onClick={handleShowOnboarding} className="h-8 ml-2" variant="secondary">
                Build Your Dashboard
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4 pt-2 space-y-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-base">Sections</span>
              <span className="text-xs text-gray-500">Reorder &amp; Toggle</span>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboardSections">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
                    {sectionOrder.map((sectionKey, idx) => {
                      const sec = defaultSections.find(s => s.key === sectionKey);
                      const isVisible = sectionStates.find(s => s.key === sectionKey)?.visible ?? true;
                      return (
                        <Draggable draggableId={sectionKey} index={idx} key={sectionKey}>
                          {(dragProvided, snapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={`rounded-xl border bg-background/80 overflow-hidden shadow-inner transition-shadow ${
                                snapshot.isDragging ? "shadow-lg border-primary" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4 px-4 py-2 bg-muted/60 border-b">
                                <div {...dragProvided.dragHandleProps} className="cursor-move flex items-center">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="1.5" fill="#999"/><circle cx="7" cy="12" r="1.5" fill="#999"/><circle cx="7" cy="17" r="1.5" fill="#999"/><circle cx="12" cy="7" r="1.5" fill="#999"/><circle cx="12" cy="12" r="1.5" fill="#999"/><circle cx="12" cy="17" r="1.5" fill="#999"/><circle cx="17" cy="7" r="1.5" fill="#999"/><circle cx="17" cy="12" r="1.5" fill="#999"/><circle cx="17" cy="17" r="1.5" fill="#999"/></svg>
                                  <span className="ml-3">{sec?.label}</span>
                                </div>
                                <Switch
                                  checked={isVisible}
                                  onCheckedChange={() => handleToggleSection(sectionKey)}
                                  className="ml-2"
                                  aria-label={`Show/Hide ${sec?.label}`}
                                />
                              </div>
                              {isVisible && (
                                <div className="bg-background px-2 py-4 md:px-8">
                                  {SectionComponents[sectionKey]}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </CardContent>

        <TeamManagementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          actionType={dialogAction}
          selectedTeam={selectedTeam !== 'all' ? selectedTeam : undefined}
          onConfirm={handleTeamAction}
        />
      </Card>
    </div>
  );
}
