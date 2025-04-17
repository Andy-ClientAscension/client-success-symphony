
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Client, getAllClients } from "@/lib/data";
import { KanbanColumn } from "./KanbanColumn";
import { useClientStatus } from "./useClientStatus";
import { getStatusLabel, getStatusColor, getDefaultColumnOrder } from "./ClientStatusHelper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useCallback, memo } from "react";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";
import { LoadingState } from "@/components/LoadingState";

interface ClientKanbanViewProps {
  clients: Client[];
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

// Use memo to prevent unnecessary re-renders
export const ClientKanbanView = memo(function ClientKanbanView({ 
  clients, 
  onEditMetrics, 
  onUpdateNPS 
}: ClientKanbanViewProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { clientsByStatus, handleDragEnd, refreshData, isInitialized } = useClientStatus(clients);
  
  const handleViewDetails = useCallback((client: Client) => {
    navigate(`/clients/${client.id}`);
  }, [navigate]);
  
  // Use the predefined column order
  const columnOrder = getDefaultColumnOrder();
  
  // Optimized data loading function with debounce logic to avoid repeated calls
  const loadClientsData = useCallback(() => {
    console.log("ClientKanbanView received clients:", clients?.length || 0);
    
    // If clients were provided directly, use them
    if (clients && clients.length > 0) {
      console.log("Using provided clients:", clients.length);
      refreshData(clients);
      setIsLoading(false);
      return;
    }
    
    // Try loading from storage
    const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
    if (storedClients && storedClients.length > 0) {
      console.log("Using stored clients from CLIENTS key:", storedClients.length);
      refreshData(storedClients);
      setIsLoading(false);
      return;
    }
    
    // Try loading from client status storage
    const statusClients = loadData<Client[]>(STORAGE_KEYS.CLIENT_STATUS, []);
    if (statusClients && statusClients.length > 0) {
      console.log("Using stored clients from CLIENT_STATUS key:", statusClients.length);
      refreshData(statusClients);
      setIsLoading(false);
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
      setIsLoading(false);
      return;
    }
    
    console.warn("No clients found from any source");
    setIsLoading(false);
  }, [clients, refreshData]);

  // Load initial data only once
  useEffect(() => {
    // Set a flag in sessionStorage to track if data was already loaded
    const dataLoaded = sessionStorage.getItem('kanbanDataLoaded');
    
    if (!dataLoaded) {
      setIsLoading(true);
      // Add small delay to prevent multiple simultaneous loads
      const timer = setTimeout(() => {
        loadClientsData();
        sessionStorage.setItem('kanbanDataLoaded', 'true');
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [loadClientsData]);

  // Listen for external changes to sync Kanban data, with debouncing
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;
      
      if (key === STORAGE_KEYS.CLIENTS || key === STORAGE_KEYS.CLIENT_STATUS) {
        // Debounce the refresh to avoid multiple rapid updates
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
          if (updatedClients && updatedClients.length > 0) {
            console.log("Kanban view updating due to storage event with", updatedClients.length, "clients");
            refreshData(updatedClients);
          }
        }, 300);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange as EventListener);
      clearTimeout(debounceTimer);
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
});
