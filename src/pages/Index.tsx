
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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Performance Report</h1>
          <div className="flex items-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Chart
            </Button>
            <div className="border rounded-md px-4 py-2 text-sm">
              Period: Last 30 Days ▼
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b mb-6 bg-transparent p-0">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-2 bg-transparent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-2 bg-transparent"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-2 bg-transparent"
            >
              Agents
            </TabsTrigger>
            <TabsTrigger 
              value="deals" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-2 bg-transparent"
            >
              Deals
            </TabsTrigger>
            <TabsTrigger 
              value="commissions" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-2 bg-transparent"
            >
              Commissions
            </TabsTrigger>
            <TabsTrigger 
              value="tags" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-2 bg-transparent"
            >
              Tags
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="m-0">
            <div>
              <MetricsCards />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="col-span-1">
                  <ChurnChart />
                </div>
                <div className="col-span-1">
                  <NPSChart />
                </div>
              </div>
              
              <div className="mt-6">
                <ClientList />
              </div>
              
              {!isMobile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="col-span-1">
                    <KanbanBoard />
                  </div>
                  <div className="col-span-1">
                    <PaymentAlerts />
                  </div>
                </div>
              )}
              
              {isMobile && (
                <>
                  <div className="mt-6">
                    <KanbanBoard />
                  </div>
                  <div className="mt-6">
                    <PaymentAlerts />
                  </div>
                </>
              )}
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
