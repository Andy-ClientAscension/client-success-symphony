import { useState, useEffect } from "react";
import { MoreHorizontal, ChevronRight, PlusCircle, Phone, BarChart2, DollarSign, Edit, TrendingUp, Users, Search, Download, Check, CheckSquare, Square, CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, getAllClients } from "@/lib/data";
import { ClientMetricsForm } from "./ClientMetricsForm";
import { NPSUpdateForm } from "./NPSUpdateForm";
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";
import { exportToCSV } from "@/utils/exportUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientBiWeeklyNotes } from "./ClientBiWeeklyNotes";

const TEAMS = [
  { id: "all", name: "All Teams" },
  { id: "Team-Andy", name: "Team-Andy" },
  { id: "Team-Chris", name: "Team-Chris" },
  { id: "Team-Alex", name: "Team-Alex" },
  { id: "Team-Cillin", name: "Team-Cillin" },
];

interface ClientListProps {
  statusFilter?: Client['status'];
}

export function ClientList({ statusFilter }: ClientListProps) {
  const defaultClients = getAllClients();
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
  }, [clients, selectedTeam, statusFilter, searchQuery]);
  
  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success-100 text-success-800 hover:bg-success-200">Active</Badge>;
      case 'at-risk':
        return <Badge className="bg-warning-100 text-warning-800 hover:bg-warning-200">At Risk</Badge>;
      case 'churned':
        return <Badge className="bg-danger-100 text-danger-800 hover:bg-danger-200">Churned</Badge>;
      case 'new':
        return <Badge className="bg-brand-100 text-brand-800 hover:bg-brand-200">New</Badge>;
      default:
        return null;
    }
  };
  
  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Expired';
    return `${days} days`;
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success-500';
    if (progress >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
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
    if (selectedClientIds.length === filteredClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(filteredClients.map(client => client.id));
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

  const handleExportCSV = () => {
    const csvData = filteredClients.map(client => ({
      "Client Name": client.name,
      "Status": client.status,
      "Progress": client.progress,
      "End Date": client.endDate,
      "CSM": client.csm,
      "Calls Booked": client.callsBooked,
      "Deals Closed": client.dealsClosed,
      "MRR": client.mrr,
      "NPS": client.npsScore !== null ? client.npsScore : 'N/A'
    }));

    exportToCSV(csvData, "client_overview");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Overview</CardTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedTeam} onValueChange={handleTeamChange}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                {TEAMS.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="flex gap-1 h-8 text-xs"
            title="Export to CSV"
          >
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button 
            onClick={handleAddNewClient}
            className="bg-red-600 hover:bg-red-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name or CSM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {selectedClientIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedClientIds.length} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">Bulk Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openBulkActionDialog('status')}>
                    Update Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openBulkActionDialog('team')}>
                    Assign Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <div className="flex items-center justify-center" onClick={handleSelectAll}>
                    {selectedClientIds.length === filteredClients.length && filteredClients.length > 0 ? (
                      <CheckSquare className="h-4 w-4 cursor-pointer" />
                    ) : (
                      <Square className="h-4 w-4 cursor-pointer" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>CSM</TableHead>
                <TableHead>Calls Booked</TableHead>
                <TableHead>Deals Closed</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>NPS</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center justify-center" onClick={() => handleSelectClient(client.id)}>
                      {selectedClientIds.includes(client.id) ? (
                        <CheckSquare className="h-4 w-4 cursor-pointer" />
                      ) : (
                        <Square className="h-4 w-4 cursor-pointer" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(client.progress)}`} 
                          style={{ width: `${client.progress}%` }} 
                        />
                      </div>
                      <span className="text-xs">{client.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(client.endDate), 'MMM dd, yyyy')}</span>
                      <span className="text-xs text-muted-foreground">{getDaysRemaining(client.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{client.csm || 'Unassigned'}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-red-600" />
                      <span>{client.callsBooked}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <BarChart2 className="h-3 w-3 mr-1 text-red-600" />
                      <span>{client.dealsClosed}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1 text-red-600" />
                      <span>${client.mrr}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {client.npsScore !== null ? (
                        <Badge className={
                          client.npsScore >= 8 ? "bg-success-100 text-success-800" :
                          client.npsScore >= 6 ? "bg-warning-100 text-warning-800" :
                          "bg-danger-100 text-danger-800"
                        }>
                          {client.npsScore}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleUpdateNPS(client)}
                        title="Update NPS"
                      >
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ClientBiWeeklyNotes clientId={client.id} clientName={client.name} />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditMetrics(client)}
                        title="Edit metrics"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewDetails(client)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Contact Client</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditMetrics(client)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Metrics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateNPS(client)}>
                            <TrendingUp className="h-4 w-4 mr-2" /> Update NPS
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Information</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
      
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionType === 'status' ? 'Update Status' : 'Assign Team'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will update {selectedClientIds.length} selected clients. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {bulkActionType === 'status' && (
            <Select onValueChange={setBulkActionValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {bulkActionType === 'team' && (
            <Select onValueChange={setBulkActionValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {TEAMS.filter(team => team.id !== "all").map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkActionConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
