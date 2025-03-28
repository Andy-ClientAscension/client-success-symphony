
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <div className="space-y-2 max-w-full">
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
          <ScrollArea className="w-full pb-1" orientation="horizontal">
            <TabsList className="w-full md:w-auto justify-start border-b mb-2 bg-transparent p-0 flex-nowrap">
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
                value="tags" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Tags
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
          
          <TabsContent value="overview" className="m-0">
            <div className="space-y-2">
              <MetricsCards />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
