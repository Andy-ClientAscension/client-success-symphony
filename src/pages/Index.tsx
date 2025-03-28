
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
  }, []);

  return (
    <Layout>
      <div className="p-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">Performance Report</div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="text-xs font-medium">Import Data</div>
              <div className="text-xs text-muted-foreground">Import client data</div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 h-8">
              <Import className="mr-1 h-3 w-3" /> Import
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b mb-2 bg-transparent p-0">
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
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="col-span-2">
                  <ChurnChart />
                </div>
                <div className="col-span-1">
                  <NPSChart />
                </div>
              </div>
              
              <div className="mt-2">
                <ClientList />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
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
