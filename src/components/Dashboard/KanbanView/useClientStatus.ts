
import { useState, useEffect, useMemo, useCallback } from "react";
import { Client, getAllClients } from "@/lib/data";
import { StatusGroup, getDefaultColumnOrder } from "./ClientStatusHelper";
import { saveData, STORAGE_KEYS, loadData } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";

export function useClientStatus(initialClients: Client[]) {
  const [localClients, setLocalClients] = useState<Client[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Initialize local state with clients
  const initializeClients = useCallback((clientsToUse: Client[]) => {
    if (Array.isArray(clientsToUse) && clientsToUse.length > 0) {
      console.log(`Initializing useClientStatus with ${clientsToUse.length} clients`);
      setLocalClients(clientsToUse);
      setIsInitialized(true);
    } else {
      console.warn("Attempted to initialize with invalid clients:", clientsToUse);
    }
  }, []);
  
  // Update local state when clients prop changes
  useEffect(() => {
    if (initialClients && initialClients.length > 0) {
      console.log(`useClientStatus: Received ${initialClients.length} initial clients`);
      initializeClients(initialClients);
    } else {
      console.log("useClientStatus: No initial clients provided, trying storage");
      // If no initial clients provided, try to load from storage
      const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
      if (storedClients && storedClients.length > 0) {
        console.log(`useClientStatus: Using ${storedClients.length} clients from storage`);
        initializeClients(storedClients);
      } else {
        // Last resort: use default clients
        const defaultClients = getAllClients();
        if (defaultClients.length > 0) {
          console.log(`useClientStatus: Using ${defaultClients.length} default clients`);
          initializeClients(defaultClients);
          
          // Save to storage for other components
          saveData(STORAGE_KEYS.CLIENTS, defaultClients);
          saveData(STORAGE_KEYS.CLIENT_STATUS, defaultClients);
        }
      }
    }
  }, [initialClients, initializeClients]);
  
  // Refresh data function that can be called externally
  const refreshData = useCallback((updatedClients: Client[]) => {
    if (Array.isArray(updatedClients) && updatedClients.length > 0) {
      console.log(`refreshData called with ${updatedClients.length} clients`);
      setLocalClients(updatedClients);
      setIsInitialized(true);
      
      // Ensure proper synchronization by saving to storage
      saveData(STORAGE_KEYS.CLIENT_STATUS, updatedClients);
    } else {
      console.warn("Attempted to refresh with invalid clients data:", updatedClients);
      
      // Try to load from storage as fallback
      const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
      if (storedClients && storedClients.length > 0) {
        console.log(`refreshData: Using ${storedClients.length} clients from storage as fallback`);
        setLocalClients(storedClients);
        setIsInitialized(true);
      }
    }
  }, []);
  
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
    
    const totalClients = Object.values(groups).reduce((sum, group) => sum + group.length, 0);
    console.log(`clientsByStatus: Grouped ${totalClients} clients across ${columnOrder.length} columns`);
    
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
    setLocalClients(updatedClients);
    
    // Persist the changes to be remembered across page refreshes
    saveData(STORAGE_KEYS.CLIENT_STATUS, updatedClients);
    saveData(STORAGE_KEYS.CLIENTS, updatedClients);
    
    // Dispatch a custom event to notify other components about the update
    const event = new CustomEvent('storageUpdated', { 
      detail: { key: STORAGE_KEYS.CLIENTS }
    });
    window.dispatchEvent(event);
    
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
