
import { useState, useEffect, useMemo } from 'react';
import { analyzeClientData, AIInsight } from '@/utils/aiDataAnalyzer';
import { Client, getAllClients } from '@/lib/data';
import { STORAGE_KEYS, saveData, loadData, deleteClientsGlobally } from '@/utils/persistence';
import { useToast } from "@/hooks/use-toast";
import { useKanbanStore } from "@/utils/kanbanStore";

interface UseClientListProps {
  statusFilter?: Client['status'];
}

export function useClientList({ statusFilter }: UseClientListProps) {
  const { toast } = useToast();
  const kanbanStore = useKanbanStore();
  
  const defaultClients = useMemo(() => {
    try {
      return getAllClients();
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
  
  const [clients, setClients] = useState<Client[]>(defaultClients);
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
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);

  const validateClients = (clientList: Client[]): Client[] => {
    if (!Array.isArray(clientList)) return [];
    
    return clientList.filter(client => {
      if (!client || typeof client !== 'object') return false;
      if (!client.id || typeof client.id !== 'string') return false;
      if (!client.name || typeof client.name !== 'string') return false;
      
      if (!client.status || !['active', 'at-risk', 'churned', 'new'].includes(client.status)) {
        client.status = 'active';
      }
      
      if (client.mrr === undefined || client.mrr === null || isNaN(client.mrr)) {
        client.mrr = 0;
      }
      
      if (client.progress === undefined || client.progress === null || isNaN(client.progress)) {
        client.progress = 0;
      }
      
      return true;
    });
  };

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
    
    setCurrentPage(1);
  }, [clients, selectedTeam, statusFilter, searchQuery, defaultClients]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, Math.min(indexOfLastItem, filteredClients.length));
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  useEffect(() => {
    setClients(validateClients(defaultClients));
  }, [defaultClients]);

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
    
    setClients(prev => prev.filter(client => !clientIdsToDelete.includes(client.id)));
    
    if (kanbanStore && kanbanStore.updateData) {
      const updatedKanbanData = { ...kanbanStore.data };
      
      if (updatedKanbanData.columns) {
        Object.keys(updatedKanbanData.columns).forEach(columnId => {
          if (updatedKanbanData.columns[columnId] && updatedKanbanData.columns[columnId].studentIds) {
            updatedKanbanData.columns[columnId].studentIds = updatedKanbanData.columns[columnId].studentIds.filter(
              id => !clientIdsToDelete.includes(id)
            );
          }
        });
      }
      
      if (updatedKanbanData.students) {
        clientIdsToDelete.forEach(id => {
          if (updatedKanbanData.students[id]) {
            delete updatedKanbanData.students[id];
          }
        });
      }
      
      kanbanStore.updateData(updatedKanbanData);
    }
    
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
    
    setClients(updatedClients);
    
    saveData(STORAGE_KEYS.CLIENTS, updatedClients);
    saveData(STORAGE_KEYS.CLIENT_STATUS, updatedClients);
    
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

  useEffect(() => {
    const performAIAnalysis = async () => {
      try {
        if (clients && clients.length > 0) {
          console.log("Performing AI analysis on", clients.length, "clients");
          const insights = await analyzeClientData(clients);
          setAIInsights(insights || []);
        } else {
          console.log("No clients available for AI analysis");
          setAIInsights([]);
        }
      } catch (error) {
        console.error("Error in AI analysis:", error);
        setAIInsights([{
          type: 'warning',
          message: 'An error occurred during client data analysis.',
          severity: 'medium'
        }]);
      }
    };

    // Run AI analysis when clients change
    performAIAnalysis();
  }, [clients]);

  useEffect(() => {
    const handleStorageEvent = (event: any) => {
      const isRelevant = event.key === STORAGE_KEYS.CLIENTS || 
                          event.key === STORAGE_KEYS.CLIENT_STATUS || 
                          (event.detail && (
                            event.detail.key === STORAGE_KEYS.CLIENTS || 
                            event.detail.key === STORAGE_KEYS.CLIENT_STATUS
                          ));
      
      if (isRelevant) {
        const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
        setClients(validateClients(updatedClients));
        console.log("Clients updated in useClientList due to external change");
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('storageUpdated', handleStorageEvent);
    window.addEventListener('storageRestored', () => {
      const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
      setClients(validateClients(updatedClients));
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('storageUpdated', handleStorageEvent);
      window.removeEventListener('storageRestored', handleStorageEvent as EventListener);
    };
  }, []);

  return {
    clients,
    setClients,
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
    aiInsights
  };
}
