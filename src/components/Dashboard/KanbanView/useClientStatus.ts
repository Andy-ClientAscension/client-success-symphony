
import { useState, useEffect, useMemo, useCallback } from "react";
import { Client, getAllClients } from "@/lib/data";
import { StatusGroup, getDefaultColumnOrder } from "./ClientStatusHelper";
import { saveData, STORAGE_KEYS, loadData } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";
import { validateClients } from "@/utils/clientValidation";

export function useClientStatus(initialClients: Client[]) {
  const [localClients, setLocalClients] = useState<Client[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Initialize local state with clients
  const initializeClients = useCallback((clientsToUse: Client[]) => {
    if (Array.isArray(clientsToUse) && clientsToUse.length > 0) {
      // Validate clients and avoid unnecessary state updates if data is the same
      const validatedClients = validateClients(clientsToUse);
      
      setLocalClients(prevClients => {
        if (prevClients.length === validatedClients.length && 
            JSON.stringify(prevClients) === JSON.stringify(validatedClients)) {
          return prevClients;
        }
        return validatedClients;
      });
      setIsInitialized(true);
    }
  }, []);
  
  // Update local state when clients prop changes
  useEffect(() => {
    if (!isInitialized && initialClients && initialClients.length > 0) {
      initializeClients(initialClients);
    }
  }, [initialClients, initializeClients, isInitialized]);
  
  // Refresh data function that can be called externally
  const refreshData = useCallback((updatedClients: Client[]) => {
    if (Array.isArray(updatedClients) && updatedClients.length > 0) {
      // Validate clients
      const validatedClients = validateClients(updatedClients);
      
      // Check if data has actually changed to avoid unnecessary updates
      const needsUpdate = !localClients.length || 
        JSON.stringify(localClients) !== JSON.stringify(validatedClients);
      
      if (needsUpdate) {
        setLocalClients(validatedClients);
        setIsInitialized(true);
      }
    }
  }, [localClients]);
  
  // Group clients by status
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
  
  // Handle drag end event
  const handleDragEnd = useCallback((result: any) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or user dropped back in same position
    if (!destination || (destination.droppableId === source.droppableId && 
        destination.index === source.index)) {
      return;
    }
    
    // Get the client that was dragged
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
    
    // Validate and update local state and persist changes
    const validatedClients = validateClients(updatedClients);
    setLocalClients(validatedClients);
    
    // Persist the changes to be remembered across page refreshes
    saveData(STORAGE_KEYS.CLIENT_STATUS, validatedClients);
    saveData(STORAGE_KEYS.CLIENTS, validatedClients);
    
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
