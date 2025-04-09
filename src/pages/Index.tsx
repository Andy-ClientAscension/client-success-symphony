
import { Layout } from "@/components/Layout/Layout";
import { CompanyMetrics } from "@/components/Dashboard/CompanyMetrics";
import { TeamAnalytics } from "@/components/Dashboard/TeamAnalytics";
import { ClientList } from "@/components/Dashboard/ClientList";
import { ChurnChart } from "@/components/Dashboard/ChurnChart";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { KanbanBoard } from "@/components/Dashboard/KanbanBoard";
import { PaymentAlerts } from "@/components/Dashboard/PaymentAlerts";
import { TaskManager } from "@/components/Dashboard/TaskManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart2, Users, CheckSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { FocusModeToggle } from "@/components/Dashboard/FocusModeToggle";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HealthScoreSummary } from "@/components/Dashboard/HealthScore/HealthScoreSummary";
import { getAllClients } from "@/lib/data";

export default function Index() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [focusMode, setFocusMode] = useState(false);
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();
  const [expandedSections, setExpandedSections] = useState({
    metrics: true,
    teamAnalytics: true,
    clientList: true,
    kanban: false,
    healthScore: true
  });
  
  // Get all clients for the health score summary
  const allClients = getAllClients();

  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      toast({
        title: "Auto-Save Enabled",
        description: "Your dashboard data will be saved automatically between sessions",
      });
    }
  }, [toast]);

  const toggleFocusMode = (enabled: boolean) => {
    setFocusMode(enabled);
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const SectionHeader = ({ 
    title, 
    section 
  }: { 
    title: string; 
    section: keyof typeof expandedSections 
  }) => (
    <CollapsibleTrigger 
      className="flex items-center justify-between w-full p-4 font-medium border-b"
      onClick={() => toggleSection(section)}
    >
      <span>{title}</span>
      {expandedSections[section] ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </CollapsibleTrigger>
  );

  // Shared components to reduce duplication
  const ClientManagementSection = () => (
    <div className="bg-purple-50/30 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-100 dark:border-purple-900/50">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <ClientList />
        </CardContent>
      </Card>
    </div>
  );
  
  const KanbanSection = () => (
    <div className="bg-amber-50/30 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <KanbanBoard />
        </CardContent>
      </Card>
    </div>
  );
  
  const PaymentAlertsSection = () => (
    <div className="bg-amber-50/30 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <PaymentAlerts />
        </CardContent>
      </Card>
    </div>
  );
  
  const AnalyticsChartsSection = () => (
    <div className="bg-red-50/30 dark:bg-red-950/30 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <ChurnChart />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <NPSChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  const TaskManagerSection = () => (
    <div className="bg-green-50/30 dark:bg-green-950/30 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <TaskManager />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="w-full p-4 px-6 bg-gray-50 dark:bg-gray-900" role="region" aria-label="Performance Dashboard"> 
        <div className="flex items-center justify-between flex-wrap mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="text-xl font-bold">Performance Report</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="dashboard-persistence" 
                checked={persistDashboard}
                onCheckedChange={togglePersistDashboard}
                aria-label="Auto-save dashboard settings"
              />
              <Label htmlFor="dashboard-persistence" className="text-sm text-gray-600 dark:text-gray-400">
                Auto-save
              </Label>
            </div>
            
            <FocusModeToggle focusMode={focusMode} onChange={toggleFocusMode} />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-6 bg-white dark:bg-gray-800 rounded-t-lg shadow-sm">
            <TabsList className="w-full md:w-auto justify-start bg-transparent p-0" aria-label="Dashboard sections">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                aria-controls="overview-tab"
              >
                <BarChart2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="clients" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                aria-controls="clients-tab"
              >
                <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                Clients
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                aria-controls="tasks-tab"
              >
                <CheckSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                Tasks
              </TabsTrigger>
              {!focusMode && (
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                  aria-controls="analytics-tab"
                >
                  Advanced Analytics
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="m-0 p-0" role="tabpanel" id="overview-tab">
            <div className="grid gap-6">
              {/* Key Metrics section with subtle background */}
              <div className="bg-brand-50/30 dark:bg-brand-950/30 p-4 rounded-lg border border-brand-100 dark:border-brand-900/50">
                <Collapsible open={expandedSections.metrics} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <SectionHeader title="Company Metrics" section="metrics" />
                  <CollapsibleContent className="p-0">
                    <CompanyMetrics />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              {/* Health Score section with subtle background */}
              <div className="bg-success-50/30 dark:bg-success-950/30 p-4 rounded-lg border border-success-100 dark:border-success-900/50">
                <Collapsible open={expandedSections.healthScore} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <SectionHeader title="Health Score Overview" section="healthScore" />
                  <CollapsibleContent className="p-4">
                    <HealthScoreSummary clients={allClients} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              {/* Team Analytics section with subtle background */}
              {!focusMode && (
                <div className="bg-blue-50/30 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <Collapsible open={expandedSections.teamAnalytics} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <SectionHeader title="Team Analytics" section="teamAnalytics" />
                    <CollapsibleContent className="p-0">
                      <TeamAnalytics />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* Client Management section with subtle background */}
              <div className="bg-purple-50/30 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-100 dark:border-purple-900/50">
                <Collapsible open={expandedSections.clientList} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <SectionHeader title="Client Management" section="clientList" />
                  <CollapsibleContent className="p-4">
                    <ClientList />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              {/* Workflow section with subtle background */}
              {!focusMode && (
                <div className="bg-amber-50/30 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  <Collapsible open={expandedSections.kanban} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <SectionHeader title="Workflow Board" section="kanban" />
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
                        <div className="col-span-1 lg:col-span-9">
                          <KanbanBoard />
                        </div>
                        <div className="col-span-1 lg:col-span-3">
                          <PaymentAlerts />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="clients" className="m-0" role="tabpanel" id="clients-tab">
            <div className="grid gap-6">
              <ClientManagementSection />
              
              {!focusMode && <KanbanSection />}
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="m-0" role="tabpanel" id="tasks-tab">
            <TaskManagerSection />
          </TabsContent>
          
          {!focusMode && (
            <TabsContent value="analytics" className="m-0" role="tabpanel" id="analytics-tab">
              <div className="grid gap-6">
                <AnalyticsChartsSection />
                <PaymentAlertsSection />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
