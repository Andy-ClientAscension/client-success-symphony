
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APIConnectionDialog } from "./APIConnectionDialog";
import { ZapierIntegration } from "./AutomationServices/ZapierIntegration";
import { MakeIntegration } from "./AutomationServices/MakeIntegration";
import { KajabiIntegration } from "./AutomationServices/KajabiIntegration";
import { isApiConnected } from "@/lib/api";

export function AutomationManager() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("zapier");
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [webhooks, setWebhooks] = useState(() => {
    const saved = localStorage.getItem("automationWebhooks");
    return saved ? JSON.parse(saved) : [];
  });

  const zapierConnected = isApiConnected("zapier");
  const makeConnected = isApiConnected("make");
  const kajabiConnected = isApiConnected("kajabi");

  const connectService = () => {
    setApiDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automations</h2>
          <p className="text-muted-foreground">
            Configure your automation workflows to streamline client management
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="zapier" className="flex items-center">
            <span className="relative">
              Zapier
              {zapierConnected && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="make" className="flex items-center">
            <span className="relative">
              Make (Integromat)
              {makeConnected && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="kajabi" className="flex items-center">
            <span className="relative">
              Kajabi
              {kajabiConnected && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
              )}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zapier" className="space-y-4">
          <ZapierIntegration 
            webhooks={webhooks}
            setWebhooks={setWebhooks}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            connectService={connectService}
          />
        </TabsContent>

        <TabsContent value="make" className="space-y-4">
          <MakeIntegration 
            webhooks={webhooks}
            setWebhooks={setWebhooks}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            connectService={connectService}
          />
        </TabsContent>

        <TabsContent value="kajabi" className="space-y-4">
          <KajabiIntegration connectService={connectService} />
        </TabsContent>
      </Tabs>

      <APIConnectionDialog 
        open={apiDialogOpen} 
        onOpenChange={setApiDialogOpen} 
      />
    </div>
  );
}
