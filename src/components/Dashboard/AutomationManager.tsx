
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiIntegrations, isApiConnected } from "@/lib/api";
import { AlertCircle, CheckCircle, Plus, RefreshCw, Workflow, Zap } from "lucide-react";
import { APIConnectionDialog } from "./APIConnectionDialog";

export function AutomationManager() {
  const { toast } = useToast();
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
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
      service: activeTab,
      name: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Webhook ${webhooks.length + 1}`,
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
      let response;
      
      if (webhook.service === "zapier") {
        response = await apiIntegrations.zapier.triggerWebhook(webhook.url, {
          timestamp: new Date().toISOString(),
          source: "Client Dashboard",
          event: "manual_trigger"
        });
      } else if (webhook.service === "make") {
        response = await apiIntegrations.make.triggerScenario(webhook.url, {
          timestamp: new Date().toISOString(),
          source: "Client Dashboard",
          event: "manual_trigger"
        });
      }
      
      if (response && response.success) {
        // Update last triggered time
        const updatedWebhooks = webhooks.map(w => 
          w.id === webhook.id ? {...w, lastTriggered: new Date().toISOString()} : w
        );
        setWebhooks(updatedWebhooks);
        localStorage.setItem("automationWebhooks", JSON.stringify(updatedWebhooks));
        
        toast({
          title: "Automation Triggered",
          description: `Successfully triggered the ${webhook.service} automation`,
        });
      } else {
        throw new Error("Failed to trigger automation");
      }
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Trigger Failed",
        description: `Failed to trigger the ${webhook.service} automation. Please check the configuration.`,
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

  const connectService = () => {
    setApiDialogOpen(true);
  };

  const renderConnectionStatus = (service: string) => {
    const connected = isApiConnected(service);
    
    if (connected) {
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

  const filteredWebhooks = webhooks.filter(webhook => webhook.service === activeTab);

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Zapier Integration
              </CardTitle>
              <CardDescription>
                Connect your dashboard to Zapier to automate workflows with 5,000+ apps
              </CardDescription>
              <div className="mt-2">{renderConnectionStatus("zapier")}</div>
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
        </TabsContent>

        <TabsContent value="make" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Workflow className="h-5 w-5 mr-2 text-blue-500" />
                Make (Integromat) Integration
              </CardTitle>
              <CardDescription>
                Connect to Make's advanced workflow automation platform
              </CardDescription>
              <div className="mt-2">{renderConnectionStatus("make")}</div>
            </CardHeader>
            {makeConnected && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="make-webhook">Make Webhook URL</Label>
                  <div className="flex mt-2">
                    <Input 
                      id="make-webhook" 
                      placeholder="https://hook.eu1.make.com/..." 
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="flex-1 mr-2"
                    />
                    <Button onClick={handleAddWebhook}>Add</Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add a Make webhook URL to trigger scenarios from this dashboard
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
        </TabsContent>

        <TabsContent value="kajabi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7E22CE" />
                  <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#9333EA" fillOpacity="0.8" />
                </svg>
                Kajabi Integration
              </CardTitle>
              <CardDescription>
                Connect to Kajabi for online courses and digital product automation
              </CardDescription>
              <div className="mt-2">{renderConnectionStatus("kajabi")}</div>
            </CardHeader>
            {kajabiConnected && (
              <CardContent className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-2" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Kajabi webhooks are not available in the current integration. Please use Zapier or Make to connect with Kajabi.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={() => {
                        toast({
                          title: "Fetching Courses",
                          description: "Getting courses from Kajabi...",
                        });
                        apiIntegrations.kajabi.getCourses().then(response => {
                          if (response.success) {
                            toast({
                              title: "Success",
                              description: "Courses retrieved successfully",
                            });
                          }
                        });
                      }}>
                        Fetch Courses
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={() => {
                        toast({
                          title: "Fetching Members",
                          description: "Getting members from Kajabi...",
                        });
                        apiIntegrations.kajabi.getMembers().then(response => {
                          if (response.success) {
                            toast({
                              title: "Success",
                              description: "Members retrieved successfully",
                            });
                          }
                        });
                      }}>
                        Fetch Members
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <APIConnectionDialog 
        open={apiDialogOpen} 
        onOpenChange={setApiDialogOpen} 
      />
    </div>
  );
}
