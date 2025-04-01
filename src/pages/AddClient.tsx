
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/components/Dashboard/ClientForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";

const AddClient = () => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate("/clients");
  };
  
  const handleSubmit = (data: any) => {
    console.log("New client data:", data);
    
    // Generate a unique ID for the new client
    const newClientId = `client-${Date.now()}`;
    
    // Prepare the client data
    const newClient = {
      id: newClientId,
      name: data.name,
      status: data.status,
      progress: 0,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      lastCommunication: new Date().toISOString(),
      team: data.team,
      csm: "Unassigned", // This will be assigned later
      callsBooked: 0,
      dealsClosed: 0,
      mrr: 0,
      npsScore: null,
      lastPayment: {
        amount: 0,
        date: new Date().toISOString(),
      },
      communicationLog: []
    };
    
    // Load existing clients
    const existingClients = loadData(STORAGE_KEYS.CLIENTS, []);
    
    // Add new client
    const updatedClients = [...existingClients, newClient];
    
    // Save to storage
    saveData(STORAGE_KEYS.CLIENTS, updatedClients);
    
    // Show success message
    toast({
      title: "Client Added",
      description: `${data.name} has been added to ${data.team}`,
    });
    
    // Navigate back to clients page
    navigate("/clients");
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
              <Button asChild variant="destructive" className="gap-2 text-white bg-red-600 hover:bg-red-700 text-base px-6 py-2 flex-shrink-0">
                <Link to="/clients">
                  <Home className="h-5 w-5" />
                  Return to Clients
                </Link>
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientForm 
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddClient;
