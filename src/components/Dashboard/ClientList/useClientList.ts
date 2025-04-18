
import { useState, useEffect, useMemo } from 'react';
import { Client, getAllClients } from '@/lib/data';
import { STORAGE_KEYS, saveData, loadData, deleteClientsGlobally } from '@/utils/persistence';
import { useToast } from "@/hooks/use-toast";
import { useKanbanStore } from "@/utils/kanbanStore";
import { validateClients } from '@/utils/clientValidation';
import { useRealtimeData } from '@/utils/dataSyncService';

interface UseClientListProps {
  statusFilter?: Client['status'];
}

export function useClientList({ statusFilter }: UseClientListProps) {
  const { toast } = useToast();
  const kanbanStore = useKanbanStore();
  
  // Get default clients as a memoized value
  const defaultClients = useMemo(() => {
    try {
      const allClients = getAllClients();
      return validateClients(allClients);
    } catch (error) {
      console.error("Error loading default clients:", error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load client data. Using fallback data.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);
  
  // Use the realtime data hook for clients
  const [clients, isClientsLoading, setRealtimeClients] = useRealtimeData<Client[]>(STORAGE_KEYS.CLIENTS, defaultClients);
  
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [npsModalOpen, setNpsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'status' | 'team' | 'column' | 'delete' | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filter clients when any related state changes
  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    
    if (persistEnabled && clients !== defaultClients) {
      const validatedClients = validateClients(clients);
      saveData(STORAGE_KEYS.CLIENTS, validatedClients);
      saveData(STORAGE_KEYS.CLIENT_STATUS, validatedClients);
    }
    
    let filtered = validateClients(clients);
    
    if (statusFilter) {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    if (selectedTeam !== "all") {
      filtered = filtered.filter(client => {
        const clientTeam = client.team || ""; 
        return clientTeam.toLowerCase() === selectedTeam.toLowerCase();
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(query) || 
        (client.csm && client.csm.toLowerCase().includes(query))
      );
    }

    setFilteredClients(filtered);
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [clients, selectedTeam, statusFilter, searchQuery, defaultClients]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, Math.min(indexOfLastItem, filteredClients.length));
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedClientIds.length === currentItems.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(currentItems.map(client => client.id));
    }
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewModeChange = (mode: 'table' | 'kanban') => {
    setViewMode(mode);
  };

  const deleteClients = (clientIdsToDelete: string[]) => {
    deleteClientsGlobally(clientIdsToDelete);
    
    setSelectedClientIds([]);
    
    toast({
      title: "Clients Deleted",
      description: `${clientIdsToDelete.length} client(s) have been removed from all dashboards.`,
    });
  };

  const updateClientStatus = (clientIds: string[], newStatus: Client['status']) => {
    const updatedClients = clients.map(client => {
      if (clientIds.includes(client.id)) {
        return { ...client, status: newStatus };
      }
      return client;
    });
    
    // Update both local state and persisted data
    setRealtimeClients(updatedClients);
    
    if (kanbanStore && kanbanStore.moveStudent) {
      clientIds.forEach(clientId => {
        let currentColumn = '';
        if (kanbanStore.data && kanbanStore.data.columns) {
          Object.keys(kanbanStore.data.columns).forEach(columnId => {
            if (kanbanStore.data.columns[columnId]?.studentIds?.includes(clientId)) {
              currentColumn = columnId;
            }
          });
        }
        
        if (currentColumn && currentColumn !== newStatus) {
          kanbanStore.moveStudent(clientId, currentColumn, newStatus, 0, 0);
        }
      });
    }
    
    toast({
      title: "Status Updated",
      description: `${clientIds.length} client(s) status updated to ${newStatus}.`,
    });
  };

  return {
    clients,
    setClients: setRealtimeClients,
    filteredClients,
    selectedClient,
    setSelectedClient,
    metricsModalOpen,
    setMetricsModalOpen,
    npsModalOpen,
    setNpsModalOpen,
    selectedTeam,
    searchQuery,
    selectedClientIds,
    setSelectedClientIds,
    bulkActionDialogOpen,
    setBulkActionDialogOpen,
    bulkActionType,
    setBulkActionType,
    bulkActionValue,
    setBulkActionValue,
    currentPage,
    itemsPerPage,
    viewMode,
    indexOfLastItem,
    indexOfFirstItem,
    currentItems,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    handleSelectClient,
    handleSelectAll,
    handleTeamChange,
    handleSearchChange,
    handleViewModeChange,
    deleteClients,
    updateClientStatus,
    isLoading: isClientsLoading
  };
}
