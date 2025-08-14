
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Client, getAllClients } from '@/lib/data';
import { STORAGE_KEYS, saveData, loadData, deleteClientsGlobally } from '@/utils/persistence';
import { useToast } from "@/hooks/use-toast";
import { useKanbanStore } from "@/utils/kanbanStore";
import { validateClients } from '@/utils/clientValidation';
import { useRealtimeData } from '@/utils/dataSyncService';
import { useSmartLoading } from '@/hooks/useSmartLoading';
import { useStableCallback } from '@/hooks/useStableCallback';
import { DataStabilizer } from '@/utils/dataStabilizer';
import { safeLogger } from '@/utils/code-quality-fixes';

interface UseClientListProps {
  statusFilter?: Client['status'];
}

export function useClientList({ statusFilter }: UseClientListProps = {}) {
  const { toast } = useToast();
  const kanbanStore = useKanbanStore();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Get default clients as a stable memoized value - fix re-render loop
  const defaultClients = useMemo(() => {
    try {
      safeLogger.debug("Loading default clients from data service");
      const allClients = getAllClients();
      return validateClients(allClients);
    } catch (error) {
      safeLogger.error("Error loading default clients:", error);
      return [];
    }
  }, []); // Empty deps to prevent re-computation
  
  // Use the realtime data hook for clients with proper arguments
  const [clients, isClientsLoading] = useRealtimeData<Client[]>(
    STORAGE_KEYS.CLIENTS, 
    defaultClients
  );
  
  // Keep a ref to the latest clients to avoid stale closure issues
  const clientsRef = useRef(clients);
  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);
  
  // Use smart loading to prevent flashing
  const { isLoading: showLoading } = useSmartLoading(isClientsLoading || isInitializing, {
    minLoadingTime: 800,
    loadingDelay: 200,
    priority: 1
  });
  
  // Handle errors separately
  useEffect(() => {
    const handleError = (event: Event) => {
      const customEvent = event as CustomEvent;
      safeLogger.error("Error in realtime data hook:", customEvent.detail);
      toast({
        title: "Data Sync Error",
        description: "There was a problem syncing client data.",
        variant: "destructive",
      });
    };

    // Add error event listener
    window.addEventListener('dataSync:error', handleError);
    
    return () => {
      window.removeEventListener('dataSync:error', handleError);
    };
  }, [toast]);
  
  // UI state
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
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
  
  // Create a stable function to update clients with deduplication
  const setClients = useStableCallback((updatedClients: Client[]) => {
    const validatedClients = validateClients(updatedClients);
    safeLogger.debug(`Saving ${validatedClients.length} clients to storage`);
    
    // Use data stabilizer to prevent unnecessary updates
    if (DataStabilizer.hasDataChanged(STORAGE_KEYS.CLIENTS, validatedClients)) {
      saveData(STORAGE_KEYS.CLIENTS, validatedClients);
      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('storageUpdated', { 
        detail: { key: STORAGE_KEYS.CLIENTS } 
      }));
    }
  });

  // Clear initialization state once clients are loaded
  useEffect(() => {
    if (isInitializing && !isClientsLoading) {
      safeLogger.debug("useClientList: Finished initializing, clients loaded");
      setIsInitializing(false);
    }
  }, [isClientsLoading, isInitializing]);

  // Filter clients with stable dependencies to prevent re-render loops
  const filteredClientsStable = useMemo(() => {
    if (isInitializing) {
      safeLogger.debug("useClientList: Still initializing, returning empty array");
      return [];
    }
    
    let filtered = validateClients(clients);
    safeLogger.debug(`useClientList: Filtering ${filtered.length} clients with statusFilter:`, statusFilter);
    
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

    safeLogger.debug(`useClientList: Filtered to ${filtered.length} clients`);
    return filtered;
  }, [clients, selectedTeam, statusFilter, searchQuery, isInitializing]);

  // Update filteredClients when the memoized value changes
  useEffect(() => {
    setFilteredClients(filteredClientsStable);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filteredClientsStable]);

  // Persist data changes when clients change (separate from filtering)
  useEffect(() => {
    if (!isInitializing) {
      const persistEnabled = localStorage.getItem("persistDashboard") === "true";
      
      if (persistEnabled && clients.length > 0) {
        const validatedClients = validateClients(clients);
        saveData(STORAGE_KEYS.CLIENTS, validatedClients);
        saveData(STORAGE_KEYS.CLIENT_STATUS, validatedClients);
      }
    }
  }, [clients, isInitializing]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = useMemo(() => {
    return filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredClients, indexOfFirstItem, indexOfLastItem]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(filteredClients.length / itemsPerPage);
  }, [filteredClients.length, itemsPerPage]);

  // Use stable callbacks to prevent dependency issues
  const handlePageChange = useStableCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredClients.length / itemsPerPage))));
  });

  const handleItemsPerPageChange = useStableCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  });

  const handleSelectClient = useStableCallback((clientId: string) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  });
  
  const handleSelectAll = useStableCallback(() => {
    const currentItems = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    setSelectedClientIds(prev => 
      prev.length === currentItems.length ? [] : currentItems.map(client => client.id)
    );
  });

  const handleTeamChange = useStableCallback((value: string) => {
    setSelectedTeam(value);
  });

  const handleSearchChange = useStableCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  });

  const handleViewModeChange = useStableCallback((mode: 'table' | 'kanban') => {
    setViewMode(mode);
  });

  const deleteClients = useCallback((clientIdsToDelete: string[]) => {
    deleteClientsGlobally(clientIdsToDelete);
    
    setSelectedClientIds([]);
    
    toast({
      title: "Clients Deleted",
      description: `${clientIdsToDelete.length} client(s) have been removed from all dashboards.`,
    });
  }, [toast]);

  const updateClientStatus = useCallback((clientIds: string[], newStatus: Client['status']) => {
    const updatedClients = clients.map(client => {
      if (clientIds.includes(client.id)) {
        return { ...client, status: newStatus };
      }
      return client;
    });
    
    // Update both local state and persisted data
    setClients(updatedClients);
    
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
  }, [clients, kanbanStore, setClients, toast]);

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
    isLoading: showLoading
  };
}
