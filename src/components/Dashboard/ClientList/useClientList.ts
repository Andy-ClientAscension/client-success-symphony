
import { useState, useEffect, useMemo } from 'react';
import { Client, getAllClients } from '@/lib/data';
import { STORAGE_KEYS, saveData } from '@/utils/persistence';

interface UseClientListProps {
  statusFilter?: Client['status'];
}

export function useClientList({ statusFilter }: UseClientListProps) {
  const defaultClients = useMemo(() => getAllClients(), []);
  const [clients, setClients] = useState<Client[]>(defaultClients);
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [npsModalOpen, setNpsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'status' | 'team' | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled && clients !== defaultClients) {
      saveData(STORAGE_KEYS.CLIENTS, clients);
    }

    let filtered = clients;
    if (statusFilter) {
      filtered = clients.filter(client => client.status === statusFilter);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    handleViewModeChange
  };
}
