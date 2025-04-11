import { Layout } from "@/components/Layout/Layout";
import { CompanyMetrics } from "@/components/Dashboard/CompanyMetrics";
import { TeamAnalytics } from "@/components/Dashboard/TeamAnalytics";
import { ChurnChart } from "@/components/Dashboard/ChurnChart";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { PaymentAlerts } from "@/components/Dashboard/PaymentAlerts";
import { TaskManager } from "@/components/Dashboard/TaskManager";
import { UpcomingRenewals } from "@/components/Dashboard/UpcomingRenewals";
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
import { Button } from "@/components/ui/button";
import { BarChart2, Users, CheckSquare, ChevronDown, ChevronUp, Cpu, Zap, FileBarChart, ArrowUpRight } from "lucide-react";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { FocusModeToggle } from "@/components/Dashboard/FocusModeToggle";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HealthScoreSummary } from "@/components/Dashboard/HealthScore/HealthScoreSummary";
import { getAllClients } from "@/lib/data";
import { AutomationManager } from "@/components/Dashboard/AutomationManager";
import { Link } from "react-router-dom";

export default function Index() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [focusMode, setFocusMode] = useState(false);
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();
  const [expandedSections, setExpandedSections] = useState({
    metrics: true,
    teamAnalytics: true,
    healthScore: true
  });
  
  const [performanceMode, setPerformanceMode] = useState(false);
  
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

  const AnalyticsChartsSection = () => (
    <div className="bg-red-50/30 dark:bg-red-950/30 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <FileBarChart className="h-5 w-5 mr-2 text-red-600" />
          Key Performance Indicators
        </h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/analytics" className="flex items-center gap-1">
            Full Analytics
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Churn Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChurnChart />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NPS Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <NPSChart />
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Revenue at Risk</span>
              <span className="text-xl font-bold text-red-600">$12,400</span>
              <span className="text-xs text-red-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 rotate-45 mr-1" />
                4.2% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Avg. Client Growth</span>
              <span className="text-xl font-bold text-green-600">14.3%</span>
              <span className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                2.1% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Client Satisfaction</span>
              <span className="text-xl font-bold text-blue-600">87%</span>
              <span className="text-xs text-blue-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                3.5% from last month
              </span>
            </div>
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

  const PaymentAlertsSection = () => (
    <div className="bg-amber-50/30 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <PaymentAlerts />
        </CardContent>
      </Card>
    </div>
  );

  const AutomationSection = () => (
    <div className="bg-purple-50/30 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-100 dark:border-purple-900/50">
      <Card className="shadow-sm">
        <CardContent>
          <AutomationManager />
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
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="performance-mode" 
                checked={performanceMode}
                onCheckedChange={setPerformanceMode}
                aria-label="Toggle performance mode"
              />
              <Label htmlFor="performance-mode" className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Cpu className="h-3.5 w-3.5 mr-1" />
                Performance Mode
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
                value="tasks" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                aria-controls="tasks-tab"
              >
                <CheckSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="automations" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                aria-controls="automations-tab"
              >
                <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
                Automations
              </TabsTrigger>
              {!focusMode && (
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                  aria-controls="analytics-tab"
                >
                  <FileBarChart className="h-4 w-4 mr-2" aria-hidden="true" />
                  Advanced Analytics
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="m-0 p-0" role="tabpanel" id="overview-tab">
            <div className="grid gap-6">
              <div className="bg-brand-50/30 dark:bg-brand-950/30 p-4 rounded-lg border border-brand-100 dark:border-brand-900/50">
                <Collapsible open={expandedSections.metrics} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <SectionHeader title="Company Metrics" section="metrics" />
                  <CollapsibleContent className="p-0">
                    <CompanyMetrics />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              <div className="bg-success-50/30 dark:bg-success-950/30 p-4 rounded-lg border border-success-100 dark:border-success-900/50">
                <Collapsible open={expandedSections.healthScore} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <SectionHeader title="Health Score Overview" section="healthScore" />
                  <CollapsibleContent className="p-4">
                    <HealthScoreSummary clients={allClients} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              <div className="bg-blue-50/30 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <Collapsible open={expandedSections.teamAnalytics} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <SectionHeader title="Team Analytics" section="teamAnalytics" />
                  <CollapsibleContent className="p-0">
                    <TeamAnalytics />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              <div className="bg-blue-50/30 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <UpcomingRenewals />
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-amber-50/30 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <PaymentAlerts />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="m-0" role="tabpanel" id="tasks-tab">
            <TaskManagerSection />
          </TabsContent>
          
          <TabsContent value="automations" className="m-0" role="tabpanel" id="automations-tab">
            <AutomationSection />
          </TabsContent>
          
          {!focusMode && (
            <TabsContent value="analytics" className="m-0" role="tabpanel" id="analytics-tab">
              <div className="grid gap-6">
                <AnalyticsChartsSection />
                
                <div className="bg-blue-50/30 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Revenue by Client Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="p-3 bg-green-50 rounded-md">
                          <div className="text-xs text-gray-600">Enterprise</div>
                          <div className="text-lg font-semibold">$32,400</div>
                          <div className="text-xs text-green-600">↑ 12%</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-md">
                          <div className="text-xs text-gray-600">Mid-Market</div>
                          <div className="text-lg font-semibold">$18,750</div>
                          <div className="text-xs text-green-600">↑ 8%</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-md">
                          <div className="text-xs text-gray-600">SMB</div>
                          <div className="text-lg font-semibold">$9,200</div>
                          <div className="text-xs text-amber-600">→ 0%</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-xs text-gray-600">Startups</div>
                          <div className="text-lg font-semibold">$4,850</div>
                          <div className="text-xs text-red-600">↓ 3%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Critical Client Health Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-red-600 rounded-full mr-2"></div>
                            <span className="font-medium">Acme Corp</span>
                          </div>
                          <div className="text-sm text-red-600">Health Score: 32%</div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md">
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-amber-600 rounded-full mr-2"></div>
                            <span className="font-medium">TechStart Inc</span>
                          </div>
                          <div className="text-sm text-amber-600">Health Score: 58%</div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md">
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-amber-600 rounded-full mr-2"></div>
                            <span className="font-medium">Global Services Ltd</span>
                          </div>
                          <div className="text-sm text-amber-600">Health Score: 61%</div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/health-score">View All Health Scores</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <PaymentAlertsSection />
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button asChild>
                    <Link to="/analytics" className="flex items-center gap-2">
                      <FileBarChart className="h-4 w-4" />
                      Open Full Analytics Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {performanceMode && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-900/30">
            <div className="flex items-start">
              <Cpu className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300">Performance Mode Active</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Heavy components like the Client List and Kanban Board have been moved to the Clients page 
                  to improve dashboard performance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
