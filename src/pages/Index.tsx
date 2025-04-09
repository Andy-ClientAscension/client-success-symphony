
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
import { FocusModeToggle } from "@/components/Dashboard/FocusModeToggle";
import { Separator } from "@/components/ui/separator";

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

  const toggleFocusMode = (enabled: boolean) => {
    setFocusMode(enabled);
  };

  return (
    <Layout>
      <div className="w-full p-4 px-6 bg-gray-50 dark:bg-gray-900"> 
        <div className="flex items-center justify-between flex-wrap mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="text-xl font-bold">Performance Report</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="dashboard-persistence" 
                checked={persistDashboard}
                onCheckedChange={togglePersistDashboard}
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
            <TabsList className="w-full md:w-auto justify-start bg-transparent p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="clients" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
              >
                <Users className="h-4 w-4 mr-2" />
                Clients
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
              {!focusMode && (
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-5 py-3 bg-transparent"
                >
                  Advanced Analytics
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="m-0 p-0">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <MetricsCards />
              </div>
              
              {!focusMode && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="col-span-1 sm:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <ChurnChart />
                  </div>
                  <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <NPSChart />
                  </div>
                </div>
              )}
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <ClientList />
              </div>
              
              {!focusMode && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                  <div className="col-span-1 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <KanbanBoard />
                  </div>
                  <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <PaymentAlerts />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="clients" className="m-0">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <ClientList />
              </div>
              {!focusMode && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <KanbanBoard />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="m-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <TaskManager />
            </div>
          </TabsContent>
          
          {!focusMode && (
            <TabsContent value="analytics" className="m-0">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <ChurnChart />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <NPSChart />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <PaymentAlerts />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
