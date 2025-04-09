
import { Layout } from "@/components/Layout/Layout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
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
import { Button } from "@/components/ui/button";
import { MaximizeIcon, MinimizeIcon, BarChart2, Users, CheckSquare } from "lucide-react";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";

export default function Index() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [focusMode, setFocusMode] = useState(false);
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();

  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      toast({
        title: "Auto-Save Enabled",
        description: "Your dashboard data will be saved automatically between sessions",
      });
    }
  }, [toast]);

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    toast({
      title: focusMode ? "Focus Mode Disabled" : "Focus Mode Enabled",
      description: focusMode 
        ? "Showing all dashboard components" 
        : "Showing only essential information to reduce clutter",
    });
  };

  return (
    <Layout>
      <div className="w-full p-0 px-2"> 
        <div className="flex items-center justify-between flex-wrap mb-4">
          <div className="text-xl font-bold">Performance Report</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch 
                id="dashboard-persistence" 
                checked={persistDashboard}
                onCheckedChange={togglePersistDashboard}
              />
              <Label htmlFor="dashboard-persistence" className="text-xs">
                Auto-save
              </Label>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFocusMode}
              className="h-8 gap-1 text-xs"
            >
              {focusMode ? <MaximizeIcon className="h-3.5 w-3.5" /> : <MinimizeIcon className="h-3.5 w-3.5" />}
              {focusMode ? "Expand View" : "Focus Mode"}
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-4">
            <TabsList className="w-full md:w-auto justify-start bg-transparent p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="clients" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Clients
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                Tasks
              </TabsTrigger>
              {!focusMode && (
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
                >
                  Advanced Analytics
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="m-0 p-0">
            <div className="space-y-4">
              <MetricsCards />
              
              {!focusMode && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="col-span-1 sm:col-span-2">
                    <ChurnChart />
                  </div>
                  <div className="col-span-1">
                    <NPSChart />
                  </div>
                </div>
              )}
              
              <div>
                <ClientList />
              </div>
              
              {!focusMode && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-2">
                  <div className="col-span-1 lg:col-span-3">
                    <KanbanBoard />
                  </div>
                  <div className="col-span-1">
                    <PaymentAlerts />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="clients" className="m-0">
            <div className="space-y-4">
              <ClientList />
              {!focusMode && <KanbanBoard />}
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="m-0">
            <div className="space-y-4">
              <TaskManager />
            </div>
          </TabsContent>
          
          {!focusMode && (
            <TabsContent value="analytics" className="m-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ChurnChart />
                  <NPSChart />
                </div>
                <PaymentAlerts />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
