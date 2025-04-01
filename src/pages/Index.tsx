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
import { Button } from "@/components/ui/button";
import { PlusCircle, Import } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export default function Index() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Show a toast if persistence is enabled
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      toast({
        title: "Auto-Save Enabled",
        description: "Your dashboard data will be saved automatically between sessions",
      });
    }
  }, [toast]);

  return (
    <Layout>
      <div className="space-y-4 pb-12 w-full"> 
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-lg font-bold">Performance Report</div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col">
              <div className="text-xs font-medium">Import Data</div>
              <div className="text-xs text-muted-foreground">Import client data</div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 h-7 text-xs">
              <Import className="mr-1 h-3 w-3" /> Import
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto border-b mb-4">
            <TabsList className="w-full md:w-auto justify-start bg-transparent p-0 flex-nowrap mb-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="clients" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Clients
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Agents
              </TabsTrigger>
              <TabsTrigger 
                value="deals" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Deals
              </TabsTrigger>
              <TabsTrigger 
                value="commissions" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Commissions
              </TabsTrigger>
              <TabsTrigger 
                value="activities" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Activities
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="m-0">
            <div className="space-y-6">
              <MetricsCards />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <ChurnChart />
                </div>
                <div className="col-span-1">
                  <NPSChart />
                </div>
              </div>
              
              <div>
                <ClientList />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="col-span-1 lg:col-span-2">
                  <KanbanBoard />
                </div>
                <div className="col-span-1">
                  <PaymentAlerts />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="clients" className="m-0">
            <div className="space-y-6">
              <ClientList />
              <KanbanBoard />
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="m-0">
            <div className="space-y-4">
              <TaskManager />
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="m-0">
            <div className="text-center p-8 text-muted-foreground">
              Agents section coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="deals" className="m-0">
            <div className="text-center p-8 text-muted-foreground">
              Deals section coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="commissions" className="m-0">
            <div className="text-center p-8 text-muted-foreground">
              Commissions section coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="activities" className="m-0">
            <div className="space-y-4">
              <div className="text-center p-8 text-muted-foreground">
                Activities section coming soon
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
