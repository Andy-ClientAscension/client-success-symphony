
import { useState } from "react";
import { ClientKanbanView } from "./KanbanView/ClientKanbanView";
import { Client } from "@/lib/data";
import { ClientMetricsForm } from "./ClientMetricsForm";
import { NPSUpdateForm } from "./NPSUpdateForm";

interface EnhancedKanbanBoardProps {
  fullScreen?: boolean;
  clients?: Client[];
}

export function EnhancedKanbanBoard({ fullScreen = false, clients = [] }: EnhancedKanbanBoardProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isNPSModalOpen, setIsNPSModalOpen] = useState(false);
  
  const handleEditMetrics = (client: Client) => {
    setSelectedClient(client);
    setIsMetricsModalOpen(true);
  };
  
  const handleUpdateNPS = (client: Client) => {
    setSelectedClient(client);
    setIsNPSModalOpen(true);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow ${fullScreen ? 'p-6' : 'p-2'}`}>
      <ClientKanbanView 
        clients={clients} 
        onEditMetrics={handleEditMetrics}
        onUpdateNPS={handleUpdateNPS}
      />
      
      {selectedClient && isMetricsModalOpen && (
        <ClientMetricsForm
          isOpen={isMetricsModalOpen}
          onClose={() => setIsMetricsModalOpen(false)}
          onSubmit={(data) => {
            console.log("Metrics updated:", data);
            setIsMetricsModalOpen(false);
          }}
          clientName={selectedClient.name}
          initialData={{
            callsBooked: selectedClient.metrics?.callsBooked || 0,
            dealsClosed: selectedClient.metrics?.dealsClosed || 0,
            mrr: selectedClient.metrics?.mrr || 0
          }}
        />
      )}
      
      {selectedClient && isNPSModalOpen && (
        <NPSUpdateForm
          isOpen={isNPSModalOpen}
          onClose={() => setIsNPSModalOpen(false)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          currentScore={selectedClient.npsScore || 0}
        />
      )}
    </div>
  );
}
