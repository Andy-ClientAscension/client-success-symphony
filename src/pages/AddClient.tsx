
import React from "react";
import { Layout } from "@/components/Layout/Layout";
import { ClientForm } from "@/components/Dashboard/ClientForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AddClient() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleGoBack = () => {
    navigate("/clients");
  };
  
  const handleClientAdded = () => {
    toast({
      title: "Client Added",
      description: "New client has been successfully added.",
      variant: "default",
    });
    
    navigate("/clients");
  };
  
  return (
    <Layout>
      <div className="space-y-4 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-lg font-bold">Add New Client</h1>
          </div>
        </div>
        
        <div className="border rounded-md p-4 bg-card">
          <ClientForm onClientAdded={handleClientAdded} />
        </div>
      </div>
    </Layout>
  );
}
