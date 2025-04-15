import { useState, useEffect, useMemo } from 'react';
import { Client, getAllClients } from '@/lib/data';
import { STORAGE_KEYS, saveData, loadData } from '@/utils/persistence';
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

  // Validate clients before using them
  const validateClients = (clientList: Client[]): Client[] => {
    if (!Array.isArray(clientList)) return [];
    
    return clientList.filter(client => {
      if (!client || typeof client !== 'object') return false;
      if (!client.id || typeof client.id !== 'string') return false;
      if (!client.name || typeof client.name !== 'string') return false;
      
      // Ensure client status is valid
      if (!client.status || !['active', 'at-risk', 'churned', 'new'].includes(client.status)) {
        // Fix invalid status
        client.status = 'active';
      }
      
      // Fix numeric fields if they're invalid
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
    
    // Save data if persistence is enabled and there are changes
    if (persistEnabled && clients !== defaultClients) {
      const validatedClients = validateClients(clients);
      saveData(STORAGE_KEYS.CLIENTS, validatedClients);
    }
    
    // Apply filters
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

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, Math.min(indexOfLastItem, filteredClients.length));
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Update clients when default clients change
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

  // New function to delete clients globally
  const deleteClients = (clientIdsToDelete: string[]) => {
    // 1. Update local client state
    const updatedClients = clients.filter(client => !clientIdsToDelete.includes(client.id));
    setClients(updatedClients);
    
    // 2. Persist changes to localStorage
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      saveData(STORAGE_KEYS.CLIENTS, updatedClients);
    }
    
    // 3. Update kanban store to remove these clients from all boards
    // If they're represented as students in the kanban board
    if (kanbanStore && kanbanStore.data && kanbanStore.data.students) {
      const updatedKanbanData = { ...kanbanStore.data };
      
      // Remove students from columns
      if (updatedKanbanData.columns) {
        Object.keys(updatedKanbanData.columns).forEach(columnId => {
          if (updatedKanbanData.columns[columnId] && updatedKanbanData.columns[columnId].studentIds) {
            updatedKanbanData.columns[columnId].studentIds = updatedKanbanData.columns[columnId].studentIds.filter(
              id => !clientIdsToDelete.includes(id)
            );
          }
        });
      }
      
      // Remove students from the students object
      if (updatedKanbanData.students) {
        clientIdsToDelete.forEach(id => {
          if (updatedKanbanData.students[id]) {
            delete updatedKanbanData.students[id];
          }
        });
      }
      
      // Update the kanban store
      kanbanStore.updateData(updatedKanbanData);
    }
    
    // Reset selection
    setSelectedClientIds([]);
    
    // Show confirmation toast
    toast({
      title: "Clients Deleted",
      description: `${clientIdsToDelete.length} client(s) have been removed from all dashboards.`,
    });
  };

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
    deleteClients
  };
}
