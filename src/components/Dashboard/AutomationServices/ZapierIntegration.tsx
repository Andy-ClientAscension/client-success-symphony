
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, RefreshCw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiIntegrations, isApiConnected } from "@/lib/api";

interface ZapierIntegrationProps {
  webhooks: any[];
  setWebhooks: (webhooks: any[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  connectService: () => void;
}

export function ZapierIntegration({
  webhooks,
  setWebhooks,
  isLoading,
  setIsLoading,
  webhookUrl,
  setWebhookUrl,
  connectService
}: ZapierIntegrationProps) {
  const { toast } = useToast();
  const zapierConnected = isApiConnected("zapier");
  
  const handleAddWebhook = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    const newWebhooks = [...webhooks, {
      id: Date.now().toString(),
      url: webhookUrl,
      service: "zapier",
      name: `Zapier Webhook ${webhooks.filter(w => w.service === "zapier").length + 1}`,
      enabled: true,
      lastTriggered: null
    }];
    
    setWebhooks(newWebhooks);
    localStorage.setItem("automationWebhooks", JSON.stringify(newWebhooks));
    setWebhookUrl("");
    toast({
      title: "Webhook Added",
      description: "Your automation webhook has been added successfully",
    });
  };

  const handleTriggerWebhook = async (webhook: any) => {
    setIsLoading(true);
    console.log(`Triggering ${webhook.service} webhook:`, webhook.url);

    try {
      const response = await apiIntegrations.zapier.triggerWebhook(webhook.url, {
        timestamp: new Date().toISOString(),
        source: "Client Dashboard",
        event: "manual_trigger"
      });
      
      if (response && response.success) {
        // Update last triggered time
        const updatedWebhooks = webhooks.map(w => 
          w.id === webhook.id ? {...w, lastTriggered: new Date().toISOString()} : w
        );
        setWebhooks(updatedWebhooks);
        localStorage.setItem("automationWebhooks", JSON.stringify(updatedWebhooks));
        
        toast({
          title: "Automation Triggered",
          description: `Successfully triggered the Zapier automation`,
        });
      } else {
        throw new Error("Failed to trigger automation");
      }
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Trigger Failed",
        description: `Failed to trigger the Zapier automation. Please check the configuration.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebhookStatus = (id: string) => {
    const updatedWebhooks = webhooks.map(webhook => 
      webhook.id === id ? {...webhook, enabled: !webhook.enabled} : webhook
    );
    setWebhooks(updatedWebhooks);
    localStorage.setItem("automationWebhooks", JSON.stringify(updatedWebhooks));
  };

  const deleteWebhook = (id: string) => {
    const updatedWebhooks = webhooks.filter(webhook => webhook.id !== id);
    setWebhooks(updatedWebhooks);
    localStorage.setItem("automationWebhooks", JSON.stringify(updatedWebhooks));
    toast({
      title: "Webhook Removed",
      description: "The automation webhook has been removed",
    });
  };

  const renderConnectionStatus = () => {
    if (zapierConnected) {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="text-sm">Connected</span>
        </div>
      );
    }
    
    return (
      <Button variant="outline" size="sm" onClick={connectService}>
        Connect
      </Button>
    );
  };

  const filteredWebhooks = webhooks.filter(webhook => webhook.service === "zapier");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Zapier Integration
        </CardTitle>
        <CardDescription>
          Connect your dashboard to Zapier to automate workflows with 5,000+ apps
        </CardDescription>
        <div className="mt-2">{renderConnectionStatus()}</div>
      </CardHeader>
      {zapierConnected && (
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
            <div className="flex mt-2">
              <Input 
                id="zapier-webhook" 
                placeholder="https://hooks.zapier.com/hooks/catch/..." 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 mr-2"
              />
              <Button onClick={handleAddWebhook}>Add</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Add a Zapier webhook URL to trigger zaps from this dashboard
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Your Webhooks</h4>
            
            {filteredWebhooks.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                No webhooks added yet. Add a webhook to get started.
              </div>
            ) : (
              filteredWebhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{webhook.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {webhook.url.substring(0, 40)}...
                    </div>
                    {webhook.lastTriggered && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={webhook.enabled} 
                      onCheckedChange={() => toggleWebhookStatus(webhook.id)} 
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTriggerWebhook(webhook)}
                      disabled={!webhook.enabled || isLoading}
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Test"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
