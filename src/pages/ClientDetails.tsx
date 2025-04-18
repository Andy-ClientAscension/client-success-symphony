
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { ClientDetails } from "@/components/Dashboard/ClientDetails";
import { ClientStatusUpdates } from "@/components/Dashboard/ClientStatusUpdates";
import { ClientNotesSection } from "@/components/Dashboard/ClientNotesSection";
import { CommunicationLog } from "@/components/Dashboard/CommunicationLog";
import { ClientAnalytics } from "@/components/Dashboard/ClientAnalytics";
import { CompanyMetrics } from "@/components/Dashboard/CompanyMetrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart2 } from "lucide-react";
import { Client, getAllClients } from "@/lib/data";
import { CustomFields } from "@/components/Dashboard/CustomFields";
import { ClientActivityLog } from "@/components/Dashboard/ClientActivityLog";
import { TaskManager } from "@/components/Dashboard/TaskManager";
import { useToast } from "@/hooks/use-toast";
import { HealthScoreEditor } from "@/components/Dashboard/HealthScoreEditor";

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [healthScoreEditorOpen, setHealthScoreEditorOpen] = useState(false);
  const { toast } = useToast();
  
  // Use a key to force re-render when id changes
  const [componentKey, setComponentKey] = useState(id);
  
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    // Update key when id changes to force re-rendering of all components
    setComponentKey(id);
    setLoading(true);
    
    try {
      const clients = getAllClients();
      const foundClient = clients.find(c => c.id === id);
      
      if (foundClient) {
        console.log("Client found:", foundClient.name);
        setClient(foundClient);
        // Reset to overview tab when changing clients for consistency
        setActiveTab("overview");
      } else {
        console.warn("Client not found with ID:", id);
        // No need for toast here as we'll show a proper UI for client not found
        setClient(null);
      }
    } catch (error) {
      console.error("Error loading client:", error);
      toast({
        title: "Error Loading Client",
        description: "There was a problem loading the client data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  const handleNavigateToClients = () => {
    navigate("/clients");
  };

  // Handler for tab changes to ensure proper state updates
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading client data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Card className="p-8 max-w-md w-full bg-background border-red-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
              <p className="mb-6 text-muted-foreground">
                The client you're looking for doesn't exist or has been removed.
              </p>
              <Button 
                onClick={handleNavigateToClients}
                className="bg-red-600 hover:bg-red-700"
              >
                Return to Clients
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" key={componentKey}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleNavigateToClients}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">
              {client.name}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setHealthScoreEditorOpen(true)} 
              className="border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Add Health Score
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full md:w-auto flex-nowrap overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <ClientDetails client={client} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <ClientStatusUpdates client={client} />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <CompanyMetrics />
              </div>
              <div className="col-span-1">
                <ClientActivityLog clientId={client.id} limit={5} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ClientAnalytics />
          </TabsContent>

          <TabsContent value="communication" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-1">
                <CommunicationLog communications={client.communicationLog} clientName={client.name} />
              </div>
              <div className="col-span-1 md:col-span-1">
                <ClientActivityLog clientId={client.id} limit={0} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <TaskManager clientId={client.id} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <ClientNotesSection client={client} />
          </TabsContent>
          
          <TabsContent value="custom-fields" className="mt-6">
            <CustomFields clientId={client.id} />
          </TabsContent>
        </Tabs>
      </div>
      
      {healthScoreEditorOpen && (
        <HealthScoreEditor
          isOpen={healthScoreEditorOpen}
          onClose={() => setHealthScoreEditorOpen(false)}
          onSubmit={() => {
            toast({
              title: "Health Score Added",
              description: "Health score data successfully saved.",
            });
          }}
          clientId={client.id}
          clientName={client.name}
          team={client.team || ""}
          csm={client.csm || ""}
        />
      )}
    </Layout>
  );
}
