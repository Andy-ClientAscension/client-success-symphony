
import { useState, useEffect, useMemo, useCallback } from "react";
import { Client } from "@/lib/data";
import { StatusGroup, getDefaultColumnOrder } from "./ClientStatusHelper";
import { saveData, STORAGE_KEYS, loadData } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";

export function useClientStatus(initialClients: Client[]) {
  const [localClients, setLocalClients] = useState<Client[]>(initialClients);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Update local state when clients prop changes
  useEffect(() => {
    if (initialClients && initialClients.length > 0) {
      setLocalClients(initialClients);
      setIsInitialized(true);
    }
  }, [initialClients]);
  
  // Refresh data function that can be called externally
  const refreshData = useCallback((updatedClients: Client[]) => {
    if (Array.isArray(updatedClients) && updatedClients.length > 0) {
      setLocalClients(updatedClients);
      setIsInitialized(true);
    } else {
      console.warn("Attempted to refresh with invalid clients data:", updatedClients);
    }
  }, []);
  
  // Listen for storage events to detect client status changes from other components
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;
      
      if (key === STORAGE_KEYS.CLIENTS || key === STORAGE_KEYS.CLIENT_STATUS) {
        try {
          // Reload clients from storage
          const persistEnabled = localStorage.getItem("persistDashboard") === "true";
          if (persistEnabled) {
            const savedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
            if (Array.isArray(savedClients) && savedClients.length > 0) {
              // Update our local state with the latest client list
              setLocalClients(savedClients);
              setIsInitialized(true);
              console.log("Client list updated in useClientStatus due to external change", savedClients.length);
            }
          }
        } catch (error) {
          console.error("Error handling storage change in useClientStatus:", error);
        }
      }
    };

    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for our custom event that's dispatched when data changes
    window.addEventListener('storageUpdated', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange as EventListener);
    };
  }, []);
  
  // Load any persisted client status changes
  useEffect(() => {
    try {
      const persistEnabled = localStorage.getItem("persistDashboard") === "true";
      if (persistEnabled) {
        const savedClientStatus = loadData<Client[]>(STORAGE_KEYS.CLIENT_STATUS, []);
        if (Array.isArray(savedClientStatus) && savedClientStatus.length > 0) {
          // Filter out any clients that might have been deleted globally
          const currentClientIds = new Set(initialClients.map(client => client.id));
          const validSavedClients = savedClientStatus.filter(client => 
            currentClientIds.has(client.id)
          );
          
          if (validSavedClients.length > 0) {
            console.log(`Setting ${validSavedClients.length} clients from saved status`);
            setLocalClients(validSavedClients);
            setIsInitialized(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved client status:", error);
    }
  }, [initialClients]);
  
  // Save client status changes to persistence
  const saveClientChanges = (updatedClients: Client[]) => {
    if (!Array.isArray(updatedClients) || updatedClients.length === 0) {
      console.warn("Attempted to save invalid clients data:", updatedClients);
      return;
    }
    
    setLocalClients(updatedClients);
    // Persist the changes to be remembered across page refreshes
    try {
      // Save to both locations to ensure all components are notified
      saveData(STORAGE_KEYS.CLIENT_STATUS, updatedClients);
      // Also update the main clients list to keep everything in sync
      saveData(STORAGE_KEYS.CLIENTS, updatedClients);
      
      // Dispatch a custom event to notify other components about the update
      const event = new CustomEvent('storageUpdated', { 
        detail: { key: STORAGE_KEYS.CLIENTS }
      });
      window.dispatchEvent(event);
      
      console.log(`Client status updated for ${updatedClients.length} clients and saved to both storage locations`);
    } catch (error) {
      console.error("Error saving client status changes:", error);
    }
  };
  
  // Group clients by status - ensure we create all columns even if empty
  const clientsByStatus = useMemo(() => {
    const columnOrder = getDefaultColumnOrder();
    
    // Initialize groups with all column types
    const groups: Record<string, Client[]> = {};
    columnOrder.forEach(status => {
      groups[status] = [];
    });
    
    // Populate groups with clients
    if (Array.isArray(localClients)) {
      localClients.forEach(client => {
        const status = client.status as StatusGroup;
        if (groups[status]) {
          groups[status].push(client);
        } else {
          // If status doesn't match any of our columns, add to active (default)
          groups['active'].push(client);
        }
      });
    }
    
    return groups;
  }, [localClients]);
  
  // Handle drag end event
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or user dropped back in same position
    if (!destination || (destination.droppableId === source.droppableId && 
        destination.index === source.index)) {
      return;
    }
    
    // Get the client that was dragged
    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    const clientId = draggableId;
    
    // Find the client and update its status
    const updatedClients = localClients.map(client => {
      if (client.id === clientId) {
        // Convert destColumn string to a valid status
        const newStatus = destColumn as StatusGroup;
        return { ...client, status: newStatus };
      }
      return client;
    });
    
    // Update local state and persist changes
    saveClientChanges(updatedClients);
    
    // Show toast notification
    toast({
      title: "Client Status Updated",
      description: `Client moved to ${destColumn}`,
    });
  };
  
  return { 
    localClients,
    clientsByStatus, 
    handleDragEnd,
    refreshData,
    isInitialized
  };
}
