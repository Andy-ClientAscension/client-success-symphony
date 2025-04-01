
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
      <div className="w-full p-2"> 
        <div className="flex items-center justify-between flex-wrap mb-2">
          <div className="text-xl font-bold">Performance Report</div>
          <div className="flex items-center">
            <div className="hidden sm:flex flex-col">
              <div className="text-xs font-medium">Import Data</div>
              <div className="text-xs text-muted-foreground">Import client data</div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 h-9 text-sm ml-2">
              <Import className="mr-2 h-4 w-4" /> Import
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-2">
            <TabsList className="w-full md:w-auto justify-start bg-transparent p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="clients" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                Clients
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                Agents
              </TabsTrigger>
              <TabsTrigger 
                value="deals" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                Deals
              </TabsTrigger>
              <TabsTrigger 
                value="commissions" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                Commissions
              </TabsTrigger>
              <TabsTrigger 
                value="activities" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
              >
                Activities
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="m-0 p-0">
            <div className="space-y-3">
              <MetricsCards />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-2">
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
            <div className="space-y-4">
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
            <div className="text-center p-4 text-muted-foreground">
              Agents section coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="deals" className="m-0">
            <div className="text-center p-4 text-muted-foreground">
              Deals section coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="commissions" className="m-0">
            <div className="text-center p-4 text-muted-foreground">
              Commissions section coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="activities" className="m-0">
            <div className="space-y-4">
              <div className="text-center p-4 text-muted-foreground">
                Activities section coming soon
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
