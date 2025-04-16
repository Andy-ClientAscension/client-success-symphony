
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Client } from "@/lib/data";
import { KanbanColumn } from "./KanbanColumn";
import { useClientStatus } from "./useClientStatus";
import { getStatusLabel, getStatusColor, getDefaultColumnOrder } from "./ClientStatusHelper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";

interface ClientKanbanViewProps {
  clients: Client[];
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

export function ClientKanbanView({ clients, onEditMetrics, onUpdateNPS }: ClientKanbanViewProps) {
  const navigate = useNavigate();
  const { clientsByStatus, handleDragEnd, refreshData } = useClientStatus(clients);
  
  const handleViewDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };
  
  // Use the predefined column order
  const columnOrder = getDefaultColumnOrder();
  
  // Listen for external changes to sync Kanban data
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;
      
      if (key === STORAGE_KEYS.CLIENTS || key === STORAGE_KEYS.CLIENT_STATUS) {
        // Force refresh from localStorage when external changes happen
        const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
        if (updatedClients && updatedClients.length > 0) {
          refreshData(updatedClients);
          console.log("Kanban view updated due to external data change");
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange as EventListener);
    };
  }, [refreshData]);
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ScrollArea className="w-full h-[calc(100vh-240px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2 pb-4 min-w-full">
          {columnOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              clients={clientsByStatus[status] || []}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              onUpdateNPS={onUpdateNPS}
              onEditMetrics={onEditMetrics}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </ScrollArea>
    </DragDropContext>
  );
}
