import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, getAllClients } from "@/lib/data";
import { ClientMetricsForm } from "./ClientMetricsForm";
import { NPSUpdateForm } from "./NPSUpdateForm";
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS, saveData } from "@/utils/persistence";
import { ClientListFilters } from "./ClientListFilters";
import { ClientSearchBar } from "./ClientSearchBar";
import { ClientsTable } from "./ClientsTable";
import { ClientKanbanView } from "./ClientKanbanView";
import { ClientBulkActionDialog } from "./ClientBulkActionDialog";
import { Pagination } from "./Pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutList, Kanban } from "lucide-react";

interface ClientListProps {
  statusFilter?: Client['status'];
}

export function ClientList({ statusFilter }: ClientListProps) {
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
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  }, [clients, selectedTeam, statusFilter, searchQuery]);
  
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
  
  const handleViewDetails = (client: Client) => {
    navigate(`/client/${client.id}`);
  };
  
  const handleAddNewClient = () => {
    navigate("/add-client");
  };

  const handleEditMetrics = (client: Client) => {
    setSelectedClient(client);
    setMetricsModalOpen(true);
  };

  const handleUpdateNPS = (client: Client) => {
    setSelectedClient(client);
    setNpsModalOpen(true);
  };

  const handleMetricsUpdate = (data: { callsBooked: number; dealsClosed: number; mrr: number }) => {
    if (!selectedClient) return;

    const updatedClients = clients.map(client => 
      client.id === selectedClient.id
        ? { ...client, callsBooked: data.callsBooked, dealsClosed: data.dealsClosed, mrr: data.mrr }
        : client
    );

    setClients(updatedClients);
    
    toast({
      title: "Metrics Updated",
      description: `${selectedClient.name}'s metrics have been updated successfully.`,
    });
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
  
  const openBulkActionDialog = (actionType: 'status' | 'team') => {
    if (selectedClientIds.length === 0) {
      toast({
        title: "No Clients Selected",
        description: "Please select at least one client to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }
    
    setBulkActionType(actionType);
    setBulkActionDialogOpen(true);
  };
  
  const handleBulkActionConfirm = () => {
    if (!bulkActionType || !bulkActionValue) {
      return;
    }
    
    const updatedClients = clients.map(client => {
      if (selectedClientIds.includes(client.id)) {
        if (bulkActionType === 'status') {
          return { ...client, status: bulkActionValue as Client['status'] };
        } else if (bulkActionType === 'team') {
          return { ...client, team: bulkActionValue };
        }
      }
      return client;
    });
    
    setClients(updatedClients);
    setSelectedClientIds([]);
    setBulkActionDialogOpen(false);
    
    toast({
      title: "Bulk Action Completed",
      description: `Updated ${selectedClientIds.length} clients`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Client Overview 
          <span className="text-muted-foreground text-sm ml-2">
            (Total: {filteredClients.length})
          </span>
        </CardTitle>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'table' | 'kanban')}>
            <ToggleGroupItem value="table" aria-label="List view">
              <LayoutList className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban view">
              <Kanban className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <ClientListFilters 
            selectedTeam={selectedTeam}
            searchQuery={searchQuery}
            onTeamChange={handleTeamChange}
            onSearchChange={handleSearchChange}
            filteredClients={filteredClients}
            onAddNewClient={handleAddNewClient}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ClientSearchBar 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedClientCount={selectedClientIds.length}
          onOpenBulkActions={() => {}}
        />

        {viewMode === 'table' ? (
          <>
            <ClientsTable 
              clients={currentItems}
              selectedClientIds={selectedClientIds}
              onSelectClient={handleSelectClient}
              onSelectAll={handleSelectAll}
              onViewDetails={handleViewDetails}
              onEditMetrics={handleEditMetrics}
              onUpdateNPS={handleUpdateNPS}
            />
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredClients.length}
              itemsPerPage={itemsPerPage}
              startIndex={indexOfFirstItem}
              endIndex={Math.min(indexOfLastItem, filteredClients.length)}
            />
          </>
        ) : (
          <ClientKanbanView 
            clients={currentItems} 
            onEditMetrics={handleEditMetrics} 
            onUpdateNPS={handleUpdateNPS} 
          />
        )}
      </CardContent>
      
      {selectedClient && metricsModalOpen && (
        <ClientMetricsForm
          isOpen={metricsModalOpen}
          onClose={() => setMetricsModalOpen(false)}
          onSubmit={handleMetricsUpdate}
          clientName={selectedClient.name}
          initialData={{
            callsBooked: selectedClient.callsBooked || 0,
            dealsClosed: selectedClient.dealsClosed || 0,
            mrr: selectedClient.mrr || 0
          }}
        />
      )}
      
      {selectedClient && npsModalOpen && (
        <NPSUpdateForm
          isOpen={npsModalOpen}
          onClose={() => setNpsModalOpen(false)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          currentScore={selectedClient.npsScore}
        />
      )}
      
      <ClientBulkActionDialog 
        open={bulkActionDialogOpen}
        onOpenChange={setBulkActionDialogOpen}
        actionType={bulkActionType}
        selectedCount={selectedClientIds.length}
        onValueChange={setBulkActionValue}
        onConfirm={handleBulkActionConfirm}
      />
    </Card>
  );
}
