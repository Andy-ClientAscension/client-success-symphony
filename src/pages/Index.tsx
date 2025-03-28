
import { Layout } from "@/components/Layout/Layout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { ClientList } from "@/components/Dashboard/ClientList";
import { ChurnChart } from "@/components/Dashboard/ChurnChart";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { KanbanBoard } from "@/components/Dashboard/KanbanBoard";
import { PaymentAlerts } from "@/components/Dashboard/PaymentAlerts";
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
import { PlusCircle } from "lucide-react";

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
  }, []);

  return (
    <Layout>
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Performance Report</h1>
          <div className="flex items-center gap-2">
            <Button className="bg-red-600 hover:bg-red-700 h-8 text-xs">
              <PlusCircle className="mr-1 h-3 w-3" /> Add Chart
            </Button>
            <div className="border rounded-md px-2 py-1 text-xs">
              Period: Last 30 Days ▼
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b mb-4 bg-transparent p-0">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-1 bg-transparent text-xs"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-1 bg-transparent text-xs"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-1 bg-transparent text-xs"
            >
              Agents
            </TabsTrigger>
            <TabsTrigger 
              value="deals" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-1 bg-transparent text-xs"
            >
              Deals
            </TabsTrigger>
            <TabsTrigger 
              value="commissions" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-1 bg-transparent text-xs"
            >
              Commissions
            </TabsTrigger>
            <TabsTrigger 
              value="tags" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-1 bg-transparent text-xs"
            >
              Tags
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="m-0">
            <div>
              <MetricsCards />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div className="col-span-1">
                  <ChurnChart />
                </div>
                <div className="col-span-1">
                  <NPSChart />
                </div>
              </div>
              
              <div className="mt-3">
                <ClientList />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div className="col-span-1">
                  <KanbanBoard />
                </div>
                <div className="col-span-1">
                  <PaymentAlerts />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="clients" className="m-0">
            <ClientList />
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
          
          <TabsContent value="tags" className="m-0">
            <div className="text-center p-8 text-muted-foreground">
              Tags section coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
