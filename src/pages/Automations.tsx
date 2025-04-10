
import { Layout } from "@/components/Layout/Layout";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationManager } from "@/components/Dashboard/AutomationManager";
import { AnalyticsIntegration } from "@/components/Dashboard/AnalyticsIntegration";
import { CalendlyIntegration } from "@/components/Dashboard/CalendlyIntegration";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, InfoIcon, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isApiConnected } from "@/lib/api";

export default function Automations() {
  const [activeTab, setActiveTab] = useState("automations");
  const [apiCount, setApiCount] = useState(0);
  
  useEffect(() => {
    // Check how many APIs are connected
    const services = ["zapier", "make", "kajabi", "calendly", "fathom"];
    const connectedCount = services.filter(service => isApiConnected(service)).length;
    setApiCount(connectedCount);
  }, []);

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
            <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
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
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardContent className="p-6">
                  <AutomationManager />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <InfoIcon className="h-5 w-5 text-blue-500" />
                      <h2 className="text-lg font-medium">Automation Ideas</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Client Onboarding</h3>
                          <p className="text-sm text-muted-foreground">
                            Automatically send welcome emails, schedule kickoff calls, and create tasks when a new client is added.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Payment Reminders</h3>
                          <p className="text-sm text-muted-foreground">
                            Automatically send email reminders when client payments are due or overdue.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">Health Score Alerts</h3>
                          <p className="text-sm text-muted-foreground">
                            Get notified when client health scores drop below a certain threshold.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="calendly" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CalendlyIntegration />
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <InfoIcon className="h-5 w-5 text-blue-500" />
                      <h2 className="text-lg font-medium">Scheduling Tips</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-1">Embed on Client Portal</h3>
                        <p className="text-sm text-muted-foreground">
                          Embed your Calendly scheduling page on your client portal for easy appointment booking.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Customize Availability</h3>
                        <p className="text-sm text-muted-foreground">
                          Set dedicated hours for client meetings to maintain a productive schedule.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Add Buffer Time</h3>
                        <p className="text-sm text-muted-foreground">
                          Include buffer time between meetings to prepare for the next client.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalyticsIntegration />
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <InfoIcon className="h-5 w-5 text-blue-500" />
                      <h2 className="text-lg font-medium">Analytics Best Practices</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-1">Focus on Key Metrics</h3>
                        <p className="text-sm text-muted-foreground">
                          Identify 3-5 key metrics that align with your business goals and track them consistently.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Share with Clients</h3>
                        <p className="text-sm text-muted-foreground">
                          Create custom reports for clients showing the impact of your work on their business.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Privacy First</h3>
                        <p className="text-sm text-muted-foreground">
                          Fathom Analytics provides GDPR-compliant, cookie-free tracking that respects user privacy.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
