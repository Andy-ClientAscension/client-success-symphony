
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
import { ArrowLeft } from "lucide-react";
import { Client, getAllClients } from "@/lib/data";
import { CustomFields } from "@/components/Dashboard/CustomFields";
import { ClientActivityLog } from "@/components/Dashboard/ClientActivityLog";
import { TaskManager } from "@/components/Dashboard/TaskManager";

export default function ClientDetailsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    if (!clientId) return;
    
    const clients = getAllClients();
    const foundClient = clients.find(c => c.id === clientId);
    
    if (foundClient) {
      setClient(foundClient);
    }
  }, [clientId]);

  if (!client) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
              <p className="mb-6 text-muted-foreground">
                The client you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/clients")}>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/clients")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">
              {client.name}
            </h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto flex-nowrap overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <ClientDetails client={client} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <ClientStatusUpdates clientId={client.id} />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <CompanyMetrics 
                  mrr={client.mrr || 0} 
                  npsScore={client.npsScore || 0} 
                  callsBooked={client.callsBooked || 0}
                  dealsClosed={client.dealsClosed || 0}
                />
              </div>
              <div className="col-span-1">
                <ClientActivityLog clientId={client.id} limit={5} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ClientAnalytics clientId={client.id} clientName={client.name} />
          </TabsContent>

          <TabsContent value="communication" className="mt-6">
            <CommunicationLog clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <TaskManager />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <ClientNotesSection clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <ClientActivityLog clientId={client.id} limit={0} />
          </TabsContent>
          
          <TabsContent value="custom-fields" className="mt-6">
            <CustomFields clientId={client.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
