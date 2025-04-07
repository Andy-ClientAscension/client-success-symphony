
import { useState, useEffect, useMemo } from "react";
import { Client } from "@/lib/data";
import { StatusGroup } from "./ClientStatusHelper";
import { saveData, STORAGE_KEYS } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";

// Define a type that extends Client to support our expanded status types
type ExtendedClient = Omit<Client, 'status'> & { 
  status: StatusGroup 
};

export function useClientStatus(initialClients: Client[]) {
  // Cast the initialClients to our ExtendedClient type for internal use
  const [localClients, setLocalClients] = useState<ExtendedClient[]>(initialClients as ExtendedClient[]);
  const { toast } = useToast();
  
  // Update local state when clients prop changes
  useEffect(() => {
    setLocalClients(initialClients as ExtendedClient[]);
  }, [initialClients]);
  
  // Save client status changes to persistence
  const saveClientChanges = (updatedClients: ExtendedClient[]) => {
    setLocalClients(updatedClients);
    // Persist the changes to be remembered across page refreshes
    try {
      // Cast back to Client[] when saving to maintain compatibility with other components
      saveData(STORAGE_KEYS.CLIENT_STATUS, updatedClients as unknown as Client[]);
    } catch (error) {
      console.error("Error saving client status changes:", error);
    }
  };
  
  // Group clients by status
  const clientsByStatus = useMemo(() => {
    const groups: Record<string, ExtendedClient[]> = {
      'new': [],
      'active': [],
      'backend': [],
      'olympia': [],
      'at-risk': [],
      'churned': [],
      'paused': [],
      'graduated': []
    };
    
    localClients.forEach(client => {
      const status = client.status as StatusGroup;
      if (groups[status]) {
        groups[status].push(client);
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
