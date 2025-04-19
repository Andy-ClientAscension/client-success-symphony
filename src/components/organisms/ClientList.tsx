
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, PlusCircle, Grid, List } from "lucide-react";
import { Button, Input } from "@/components/atoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS } from "@/utils/persistence";
import { useRealtimeData } from "@/utils/dataSyncService";
import { Client } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientListContent } from "@/components/Dashboard/ClientList/ClientListContent";

export function ClientList({ activeTab = "all", statusFilter }: { 
  activeTab?: string, 
  statusFilter?: Client['status'] 
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  
  // Use the realtime data hook for clients
  const [clients, isLoading] = useRealtimeData<Client[]>(
    STORAGE_KEYS.CLIENTS, 
    []
  );
  
  // Filter clients based on active tab, search query, and status filter
  const filteredClients = useMemo(() => {
    if (!clients || !Array.isArray(clients)) return [];
    
    let filtered = [...clients];
    
    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(client => client.status === activeTab);
    }
    
    // Filter by status if not "all"
    if (selectedStatus !== "all") {
      filtered = filtered.filter(client => client.status === selectedStatus);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        client => client.name.toLowerCase().includes(query) || 
                 (client.csm && client.csm.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [clients, activeTab, searchQuery, selectedStatus]);
  
  // Get paginated clients for current view
  const [currentPage, setCurrentPage] = useState(1);
  
  // Recalculate pagination when filters change
  const currentPaginationState = useMemo(() => {
    const totalItems = filteredClients.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    // Ensure current page is in bounds
    const currentPageSafe = Math.min(Math.max(1, currentPage), totalPages || 1);
    if (currentPageSafe !== currentPage) {
      setCurrentPage(currentPageSafe);
    }
    
    const indexOfLastItem = currentPageSafe * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    return {
      currentPage: currentPageSafe,
      totalPages,
      totalItems,
      itemsPerPage,
      indexOfFirstItem,
      indexOfLastItem: Math.min(indexOfLastItem, totalItems),
      onPageChange: setCurrentPage
    };
  }, [filteredClients.length, itemsPerPage, currentPage]);
  
  // Get current items for display
  const currentItems = useMemo(() => {
    return filteredClients.slice(
      currentPaginationState.indexOfFirstItem,
      currentPaginationState.indexOfLastItem
    );
  }, [filteredClients, currentPaginationState]);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedStatus, itemsPerPage]);
  
  // Handle client selection
  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  }, []);
  
  const handleSelectAll = useCallback(() => {
    if (selectedClientIds.length === currentItems.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(currentItems.map(client => client.id));
    }
  }, [currentItems, selectedClientIds]);
  
  const handleViewDetails = useCallback((client: Client) => {
    navigate(`/clients/${client.id}`);
  }, [navigate]);
  
  const handleEditMetrics = useCallback((client: Client) => {
    // Implementation will be handled elsewhere
    toast({
      title: "Edit Metrics",
      description: `Opening metrics editor for ${client.name}`,
    });
  }, [toast]);
  
  const handleUpdateNPS = useCallback((client: Client) => {
    // Implementation will be handled elsewhere
    toast({
      title: "Update NPS",
      description: `Opening NPS form for ${client.name}`,
    });
  }, [toast]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle>Client Management</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] h-9"
            />
          </div>
          
          <div className="flex items-center">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
              className="rounded-none h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('kanban')}
              className="rounded-none h-9 w-9"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={() => navigate('/add-client')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <ClientListContent 
          viewMode={viewMode}
          currentItems={currentItems}
          selectedClientIds={selectedClientIds}
          onSelectClient={handleSelectClient}
          onSelectAll={handleSelectAll}
          onViewDetails={handleViewDetails}
          onEditMetrics={handleEditMetrics}
          onUpdateNPS={handleUpdateNPS}
          {...currentPaginationState}
        />
        
        {selectedClientIds.length > 0 && (
          <div className="mt-4 p-2 border rounded bg-muted/50 flex items-center justify-between">
            <div>
              <span className="font-medium">{selectedClientIds.length}</span> clients selected
            </div>
            <div className="space-x-2">
              <Button size="sm" variant="outline">
                Bulk Actions
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedClientIds([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
