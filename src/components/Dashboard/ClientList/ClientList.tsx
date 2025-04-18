
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Client } from "@/lib/data";
import { ClientMetricsForm } from "../ClientMetricsForm";
import { NPSUpdateForm } from "../NPSUpdateForm";
import { useToast } from "@/hooks/use-toast";
import { ClientSearchBar } from "../ClientSearchBar";
import { ClientBulkActionDialog } from "../ClientBulkActionDialog";
import { ClientListHeader } from "./ClientListHeader";
import { ClientListContent } from "./ClientListContent";
import { StatusSummary } from "./StatusSummary";
import { useClientList } from "./useClientList";

interface ClientListProps {
  statusFilter?: Client['status'];
}

export function ClientList({ statusFilter }: ClientListProps) {
  const {
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
    updateClientStatus
  } = useClientList({ statusFilter });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleViewDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
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
    if (!selectedClient || !setClients) return;

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
  
  const openBulkActionDialog = (actionType: 'status' | 'team' | 'column' | 'delete') => {
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
    if (!bulkActionType || !setClients) {
      return;
    }
    
    if (bulkActionType === 'delete') {
      deleteClients(selectedClientIds);
      setBulkActionDialogOpen(false);
      return;
    }
    
    if (!bulkActionValue) {
      toast({
        title: "No Value Selected",
        description: "Please select a value to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (bulkActionType === 'status') {
      updateClientStatus(selectedClientIds, bulkActionValue as Client['status']);
    } else if (bulkActionType === 'team') {
      const updatedClients = clients.map(client => {
        if (selectedClientIds.includes(client.id)) {
          return { ...client, team: bulkActionValue };
        }
        return client;
      });
      
      setClients(updatedClients);
    } else if (bulkActionType === 'column') {
      // This maps to status in our application
      updateClientStatus(selectedClientIds, bulkActionValue as Client['status']);
    }
    
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
        <ClientListHeader
          filteredClientCount={filteredClients.length}
          selectedTeam={selectedTeam}
          searchQuery={searchQuery}
          viewMode={viewMode}
          itemsPerPage={itemsPerPage}
          onTeamChange={handleTeamChange}
          onSearchChange={handleSearchChange}
          onViewModeChange={handleViewModeChange}
          onAddNewClient={handleAddNewClient}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </CardHeader>
      <CardContent>
        {filteredClients.length > 0 && (
          <StatusSummary clients={filteredClients} variant="compact" />
        )}
        
        <ClientSearchBar 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedClientCount={selectedClientIds.length}
          onOpenBulkActions={() => openBulkActionDialog('status')}
          onDelete={() => openBulkActionDialog('delete')}
        />

        <ClientListContent 
          viewMode={viewMode}
          currentItems={currentItems}
          selectedClientIds={selectedClientIds}
          onSelectClient={handleSelectClient}
          onSelectAll={handleSelectAll}
          onViewDetails={handleViewDetails}
          onEditMetrics={handleEditMetrics}
          onUpdateNPS={handleUpdateNPS}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredClients.length}
          itemsPerPage={itemsPerPage}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
        />
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
