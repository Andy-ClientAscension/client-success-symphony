
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { ClientList } from "@/components/Dashboard/ClientList";
import { ChurnChart } from "@/components/Dashboard/ChurnChart";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { CommunicationLog } from "@/components/Dashboard/CommunicationLog";
import { ClientDetails } from "@/components/Dashboard/ClientDetails";
import { KanbanBoard } from "@/components/Dashboard/KanbanBoard";
import { getAllClients } from "@/lib/data";

const Dashboard = () => {
  const [activeClient] = useState(getAllClients()[0]);
  
  const allCommunications = getAllClients().flatMap(client => 
    client.communicationLog.map(log => ({
      ...log,
      clientName: client.name
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <div className="flex items-center gap-4">
                <Tabs defaultValue="overview" className="w-[400px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="client">Client Details</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="kanban">Student Tracking</TabsTrigger>
                <TabsTrigger value="client">Client Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <MetricsCards />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ChurnChart />
                  <NPSChart />
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <ClientList />
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <CommunicationLog 
                    communications={allCommunications.map(comm => ({
                      id: comm.id,
                      date: comm.date,
                      type: comm.type,
                      subject: `${comm.clientName} - ${comm.subject}`,
                      summary: comm.summary
                    }))} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="kanban" className="space-y-6">
                <KanbanBoard />
              </TabsContent>
              
              <TabsContent value="client" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <ClientDetails client={activeClient} />
                  </div>
                  <div className="lg:col-span-2">
                    <CommunicationLog 
                      communications={activeClient.communicationLog} 
                      clientName={activeClient.name}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
