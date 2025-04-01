
import { useMemo } from "react";
import { Client } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { Phone, BarChart2, DollarSign, ChevronRight, Edit, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientKanbanViewProps {
  clients: Client[];
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

export function ClientKanbanView({ clients, onEditMetrics, onUpdateNPS }: ClientKanbanViewProps) {
  const navigate = useNavigate();
  
  // Group clients by status
  const clientsByStatus = useMemo(() => {
    const groups: Record<string, Client[]> = {
      'new': [],
      'active': [],
      'at-risk': [],
      'churned': []
    };
    
    clients.forEach(client => {
      if (groups[client.status]) {
        groups[client.status].push(client);
      }
    });
    
    return groups;
  }, [clients]);
  
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'new': return 'New';
      case 'active': return 'Active';
      case 'at-risk': return 'At Risk';
      case 'churned': return 'Churned';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-brand-100 text-brand-800';
      case 'active': return 'bg-success-100 text-success-800';
      case 'at-risk': return 'bg-warning-100 text-warning-800';
      case 'churned': return 'bg-danger-100 text-danger-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  const handleViewDetails = (client: Client) => {
    navigate(`/client/${client.id}`);
  };
  
  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Expired';
    return `${days} days`;
  };
  
  const renderClientCard = (client: Client) => {
    return (
      <Card key={client.id} className="mb-3 overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-medium">{client.name}</div>
          <Badge className={getStatusColor(client.status)}>{getStatusLabel(client.status)}</Badge>
        </div>
        <CardContent className="p-3 text-sm space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>CSM: {client.csm || 'Unassigned'}</span>
            <span>{getDaysRemaining(client.endDate)}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center justify-center border rounded-md p-1">
              <Phone className="h-3 w-3 mr-1 text-red-600" />
              <span className="text-xs">{client.callsBooked}</span>
            </div>
            <div className="flex items-center justify-center border rounded-md p-1">
              <BarChart2 className="h-3 w-3 mr-1 text-red-600" />
              <span className="text-xs">{client.dealsClosed}</span>
            </div>
            <div className="flex items-center justify-center border rounded-md p-1">
              <DollarSign className="h-3 w-3 mr-1 text-red-600" />
              <span className="text-xs">${client.mrr}</span>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onUpdateNPS(client)}
              title="Update NPS"
            >
              <TrendingUp className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onEditMetrics(client)}
              title="Edit metrics"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleViewDetails(client)}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(clientsByStatus).map(([status, statusClients]) => (
        <div key={status} className="bg-card rounded-lg p-3 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{getStatusLabel(status)}</h3>
            <Badge className={getStatusColor(status)}>{statusClients.length}</Badge>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {statusClients.map(client => renderClientCard(client))}
          </div>
        </div>
      ))}
    </div>
  );
}
