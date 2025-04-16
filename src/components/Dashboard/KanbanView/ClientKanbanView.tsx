
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Client, getAllClients } from "@/lib/data";
import { KanbanColumn } from "./KanbanColumn";
import { useClientStatus } from "./useClientStatus";
import { getStatusLabel, getStatusColor, getDefaultColumnOrder } from "./ClientStatusHelper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { LoadingState } from "@/components/LoadingState";

interface ClientKanbanViewProps {
  clients: Client[];
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

export function ClientKanbanView({ clients, onEditMetrics, onUpdateNPS }: ClientKanbanViewProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { clientsByStatus, handleDragEnd, refreshData, isInitialized } = useClientStatus(clients);
  
  const handleViewDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };
  
  // Use the predefined column order
  const columnOrder = getDefaultColumnOrder();
  
  // Listen for external changes to sync Kanban data
  useEffect(() => {
    setIsLoading(true);
    
    try {
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
      
      // Initial load - ensure we have data
      if (clients && clients.length > 0) {
        refreshData(clients);
      } else {
        // Try loading from storage if no clients provided
        const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENT_STATUS, []);
        if (storedClients && storedClients.length > 0) {
          refreshData(storedClients);
        } else {
          // Last resort: use default clients
          const defaultClients = getAllClients();
          if (defaultClients.length > 0) {
            refreshData(defaultClients);
          }
        }
      }
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('storageUpdated', handleStorageChange as EventListener);
      };
    } catch (error) {
      console.error("Error in ClientKanbanView:", error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData, clients]);

  // Determine if we're ready to show content
  const isReady = isInitialized && !isLoading;

  if (!isReady) {
    return <LoadingState message="Loading kanban board..." />;
  }
  
  // Check if we have any clients to show
  const hasClients = Object.values(clientsByStatus).some(group => group.length > 0);
  
  if (!hasClients) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No students found. Add students to see them in the kanban view.</p>
      </div>
    );
  }
  
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
