
import { useState, useEffect, useMemo } from "react";
import { Client } from "@/lib/data";
import { StatusGroup, getDefaultColumnOrder } from "./ClientStatusHelper";
import { saveData, STORAGE_KEYS } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";

export function useClientStatus(initialClients: Client[]) {
  const [localClients, setLocalClients] = useState<Client[]>(initialClients);
  const { toast } = useToast();
  
  // Update local state when clients prop changes
  useEffect(() => {
    setLocalClients(initialClients);
  }, [initialClients]);
  
  // Save client status changes to persistence
  const saveClientChanges = (updatedClients: Client[]) => {
    setLocalClients(updatedClients);
    // Persist the changes to be remembered across page refreshes
    try {
      saveData(STORAGE_KEYS.CLIENT_STATUS, updatedClients);
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
    localClients.forEach(client => {
      const status = client.status as StatusGroup;
      if (groups[status]) {
        groups[status].push(client);
      } else {
        // If status doesn't match any of our columns, add to active (default)
        groups['active'].push(client);
      }
    });
    
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
    handleDragEnd
  };
}
