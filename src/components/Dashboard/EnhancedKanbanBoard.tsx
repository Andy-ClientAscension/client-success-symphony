
import { useState, useMemo } from "react";
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
  
  // Memoize these handlers to prevent unnecessary re-renders
  const handleEditMetrics = useMemo(() => (client: Client) => {
    setSelectedClient(client);
    setIsMetricsModalOpen(true);
  }, []);
  
  const handleUpdateNPS = useMemo(() => (client: Client) => {
    setSelectedClient(client);
    setIsNPSModalOpen(true);
  }, []);
  
  // Memoize the metrics submission handler
  const handleMetricsSubmit = useMemo(() => (data: any) => {
    console.log("Metrics updated:", data);
    setIsMetricsModalOpen(false);
  }, []);
  
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
          onSubmit={handleMetricsSubmit}
          clientName={selectedClient.name}
          initialData={{
            callsBooked: selectedClient.callsBooked || 0,
            dealsClosed: selectedClient.dealsClosed || 0,
            mrr: selectedClient.mrr || 0
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
