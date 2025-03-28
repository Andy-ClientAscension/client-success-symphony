
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/components/Dashboard/ClientForm";

const AddClient = () => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate("/");
  };
  
  const handleSubmit = (data: any) => {
    console.log("New client data:", data);
    // In a real app, you would add this client to your data store
    // For now, we'll just navigate back to the dashboard
    navigate("/");
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
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
