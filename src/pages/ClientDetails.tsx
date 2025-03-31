
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { ClientDetails } from "@/components/Dashboard/ClientDetails";
import { ClientNotesSection } from "@/components/Dashboard/ClientNotesSection";
import { ClientStatusUpdates } from "@/components/Dashboard/ClientStatusUpdates";
import { getClientById } from "@/lib/data";
import { useEffect, useState } from "react";
import { Client } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunicationLog } from "@/components/Dashboard/CommunicationLog";

export default function ClientDetailsPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const navigate = useNavigate();

  useEffect(() => {
    if (clientId) {
      const clientData = getClientById(clientId);
      if (clientData) {
        setClient(clientData);
      }
    }
  }, [clientId]);

  if (!client) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 pb-12 w-full">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/clients")} 
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{client.name}</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto border-b mb-4">
            <TabsList className="w-full md:w-auto justify-start bg-transparent p-0 flex-nowrap mb-0">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Client Details
              </TabsTrigger>
              <TabsTrigger 
                value="communications" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Communication Log
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger 
                value="status" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Status Updates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="m-0">
            <ClientDetails client={client} />
          </TabsContent>

          <TabsContent value="communications" className="m-0">
            <Card className="border-red-100">
              <CommunicationLog communications={client.communicationLog} clientName={client.name} />
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="m-0">
            <ClientNotesSection client={client} />
          </TabsContent>

          <TabsContent value="status" className="m-0">
            <ClientStatusUpdates client={client} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
