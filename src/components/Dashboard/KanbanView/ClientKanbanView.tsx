
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Client, getAllClients } from "@/lib/data";
import { KanbanColumn } from "./KanbanColumn";
import { useClientStatus } from "./useClientStatus";
import { getStatusLabel, getStatusColor, getDefaultColumnOrder } from "./ClientStatusHelper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";
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
  
  // Load all available clients if none were provided
  useEffect(() => {
    console.log("ClientKanbanView received clients:", clients?.length || 0);
    setIsLoading(true);
    
    const loadAllAvailableClients = () => {
      // If clients were provided directly, use them
      if (clients && clients.length > 0) {
        console.log("Using provided clients:", clients.length);
        refreshData(clients);
        return;
      }
      
      // Try loading from storage
      const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
      if (storedClients && storedClients.length > 0) {
        console.log("Using stored clients from CLIENTS key:", storedClients.length);
        refreshData(storedClients);
        return;
      }
      
      // Try loading from client status storage
      const statusClients = loadData<Client[]>(STORAGE_KEYS.CLIENT_STATUS, []);
      if (statusClients && statusClients.length > 0) {
        console.log("Using stored clients from CLIENT_STATUS key:", statusClients.length);
        refreshData(statusClients);
        return;
      }
      
      // Last resort: use default clients
      const defaultClients = getAllClients();
      if (defaultClients && defaultClients.length > 0) {
        console.log("Using default clients:", defaultClients.length);
        
        // Save these to storage for future use
        saveData(STORAGE_KEYS.CLIENTS, defaultClients);
        saveData(STORAGE_KEYS.CLIENT_STATUS, defaultClients);
        
        refreshData(defaultClients);
        return;
      }
      
      console.warn("No clients found from any source");
    };
    
    loadAllAvailableClients();
    setIsLoading(false);
  }, [clients, refreshData]);

  // Listen for external changes to sync Kanban data
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;
      
      if (key === STORAGE_KEYS.CLIENTS || key === STORAGE_KEYS.CLIENT_STATUS) {
        // Force refresh from localStorage when external changes happen
        const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
        if (updatedClients && updatedClients.length > 0) {
          console.log("Kanban view updating due to storage event with", updatedClients.length, "clients");
          refreshData(updatedClients);
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

  // Determine if we're ready to show content
  const isReady = isInitialized && !isLoading;

  if (!isReady) {
    return <LoadingState message="Loading kanban board..." />;
  }
  
  // Check if we have any clients to show
  const totalClients = Object.values(clientsByStatus).reduce(
    (sum, group) => sum + group.length, 0
  );
  
  if (totalClients === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No students found. Add students to see them in the kanban view.</p>
      </div>
    );
  }
  
  console.log(`Kanban view rendering with ${totalClients} total clients`);
  console.log("Column order:", columnOrder);
  
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
