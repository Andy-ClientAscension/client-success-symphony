
import { useState, useEffect, useMemo, useCallback } from "react";
import { Client, getAllClients } from "@/lib/data";
import { StatusGroup, getDefaultColumnOrder } from "./ClientStatusHelper";
import { saveData, STORAGE_KEYS, loadData } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";

export function useClientStatus(initialClients: Client[]) {
  const [localClients, setLocalClients] = useState<Client[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Initialize local state with clients - optimized with memoization
  const initializeClients = useCallback((clientsToUse: Client[]) => {
    if (Array.isArray(clientsToUse) && clientsToUse.length > 0) {
      // Avoid unnecessary state updates if data is the same
      setLocalClients(prevClients => {
        if (prevClients.length === clientsToUse.length && 
            JSON.stringify(prevClients) === JSON.stringify(clientsToUse)) {
          return prevClients;
        }
        return clientsToUse;
      });
      setIsInitialized(true);
    } else {
      console.warn("Attempted to initialize with invalid clients:", clientsToUse);
    }
  }, []);
  
  // Update local state when clients prop changes - with checks to avoid unnecessary updates
  useEffect(() => {
    if (!isInitialized && initialClients && initialClients.length > 0) {
      console.log(`useClientStatus: Received ${initialClients.length} initial clients`);
      initializeClients(initialClients);
    }
  }, [initialClients, initializeClients, isInitialized]);
  
  // Refresh data function that can be called externally - optimized with change detection
  const refreshData = useCallback((updatedClients: Client[]) => {
    if (Array.isArray(updatedClients) && updatedClients.length > 0) {
      // Check if data has actually changed to avoid unnecessary updates
      const needsUpdate = !localClients.length || 
        JSON.stringify(localClients) !== JSON.stringify(updatedClients);
      
      if (needsUpdate) {
        console.log(`refreshData processing ${updatedClients.length} clients`);
        setLocalClients(updatedClients);
        setIsInitialized(true);
      } else {
        console.log("No change detected in client data, skipping update");
      }
    }
  }, [localClients]);
  
  // Group clients by status - with memoization to prevent recalculation on every render
  const clientsByStatus = useMemo(() => {
    if (!isInitialized) {
      // Return empty structure until initialized
      const emptyGroups: Record<string, Client[]> = {};
      getDefaultColumnOrder().forEach(status => {
        emptyGroups[status] = [];
      });
      return emptyGroups;
    }
    
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
  }, [localClients, isInitialized]);
  
  // Handle drag end event - optimized
  const handleDragEnd = useCallback((result: any) => {
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
  }, [localClients, toast]);
  
  return { 
    localClients,
    clientsByStatus, 
    handleDragEnd,
    refreshData,
    isInitialized
  };
}
