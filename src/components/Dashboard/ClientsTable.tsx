
import { useState, memo } from "react";
import { format, differenceInDays } from "date-fns";
import { 
  TableCell, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow, 
  Table 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  ChevronRight, 
  Phone, 
  BarChart2, 
  DollarSign, 
  Edit, 
  TrendingUp,
  CheckSquare, 
  Square 
} from "lucide-react";
import { Client } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ClientBiWeeklyNotes } from "./ClientBiWeeklyNotes";

interface ClientsTableProps {
  clients: Client[];
  selectedClientIds: string[];
  onSelectClient: (clientId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

// Memoize the table row component to prevent unnecessary re-renders
const ClientRow = memo(({ 
  client, 
  isSelected, 
  onSelectClient, 
  onViewDetails, 
  onEditMetrics, 
  onUpdateNPS 
}: { 
  client: Client; 
  isSelected: boolean;
  onSelectClient: (clientId: string) => void;
  onViewDetails: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}) => {
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

  return (
    <TableRow key={client.id} className={isSelected ? "bg-muted/50" : ""}>
      <TableCell>
        <div 
          className="flex items-center justify-center cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onSelectClient(client.id);
          }}
        >
          {isSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
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
            onClick={(e) => {
              e.stopPropagation();
              onUpdateNPS(client);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              onEditMetrics(client);
            }}
            title="Edit metrics"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(client);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(client)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>Contact Client</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEditMetrics(client)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Metrics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateNPS(client)}>
                <TrendingUp className="h-4 w-4 mr-2" /> Update NPS
              </DropdownMenuItem>
              <DropdownMenuItem>Edit Information</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

ClientRow.displayName = "ClientRow";

export function ClientsTable({
  clients,
  selectedClientIds,
  onSelectClient,
  onSelectAll,
  onViewDetails,
  onEditMetrics,
  onUpdateNPS
}: ClientsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <div 
                className="flex items-center justify-center cursor-pointer" 
                onClick={() => onSelectAll()}
              >
                {selectedClientIds.length === clients.length && clients.length > 0 ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
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
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                No clients found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                isSelected={selectedClientIds.includes(client.id)}
                onSelectClient={onSelectClient}
                onViewDetails={onViewDetails}
                onEditMetrics={onEditMetrics}
                onUpdateNPS={onUpdateNPS}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
