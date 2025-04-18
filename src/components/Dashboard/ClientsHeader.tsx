
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ClientsHeaderProps {
  clientCount: number;
  onAddNewClient: () => void;
}

export function ClientsHeader({ clientCount, onAddNewClient }: ClientsHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="text-lg font-bold">Clients Management ({clientCount})</div>
      <Button 
        onClick={onAddNewClient}
        className="bg-red-600 hover:bg-red-700 px-6 py-2.5 text-base"
        size="lg"
      >
        <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
      </Button>
    </div>
  );
}
