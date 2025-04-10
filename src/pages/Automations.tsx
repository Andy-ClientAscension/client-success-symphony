
import { Layout } from "@/components/Layout/Layout";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Zap } from "lucide-react";
import { isApiConnected } from "@/lib/api";
import { CreateAutomationDialog } from "@/components/Dashboard/CreateAutomationDialog";
import { AutomationsTabContent } from "@/components/Dashboard/AutomationTabs/AutomationsTabContent";
import { CalendlyTabContent } from "@/components/Dashboard/AutomationTabs/CalendlyTabContent";
import { AnalyticsTabContent } from "@/components/Dashboard/AutomationTabs/AnalyticsTabContent";

export default function Automations() {
  const [activeTab, setActiveTab] = useState("automations");
  const [apiCount, setApiCount] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  useEffect(() => {
    // Check how many APIs are connected
    const services = ["zapier", "make", "kajabi", "calendly", "fathom"];
    const connectedCount = services.filter(service => isApiConnected(service)).length;
    setApiCount(connectedCount);
  }, []);

  const handleCreateAutomation = () => {
    setShowCreateDialog(true);
  };

  return (
    <Layout>
      <div className="w-full p-4 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl font-bold">Automations & Integrations</h1>
            <p className="text-muted-foreground">
              Connect your dashboard to external services and automate workflows
            </p>
          </div>
          <div>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={handleCreateAutomation}
            >
              <Zap className="h-4 w-4" />
              Create New Automation
            </Button>
          </div>
        </div>

        {apiCount === 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No integrations connected</AlertTitle>
            <AlertDescription>
              Connect to external services like Zapier, Make, Calendly, and Fathom to unlock automation and integration features.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0">
            <TabsTrigger 
              value="automations" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2 bg-transparent"
            >
              Automation Tools
            </TabsTrigger>
            <TabsTrigger 
              value="calendly" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2 bg-transparent"
            >
              Scheduling
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2 bg-transparent"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automations" className="space-y-6">
            <AutomationsTabContent />
          </TabsContent>
          
          <TabsContent value="calendly" className="space-y-6">
            <CalendlyTabContent />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTabContent />
          </TabsContent>
        </Tabs>
      </div>

      <CreateAutomationDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onAutomationCreated={() => {
          window.dispatchEvent(new CustomEvent('automation-created'));
        }}
      />
    </Layout>
  );
}
