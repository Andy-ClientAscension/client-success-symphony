
import { useState, memo } from "react";
import { format, differenceInDays } from "date-fns";
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
import { VirtualizedTable, Column } from "./Shared/VirtualizedTable";

interface ClientsTableProps {
  clients: Client[];
  selectedClientIds: string[];
  onSelectClient: (clientId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

export function ClientsTable({
  clients,
  selectedClientIds,
  onSelectClient,
  onSelectAll,
  onViewDetails,
  onEditMetrics,
  onUpdateNPS
}: ClientsTableProps) {
  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400 hover:bg-success-200 dark:hover:bg-success-900/50">Active</Badge>;
      case 'at-risk':
        return <Badge className="bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400 hover:bg-warning-200 dark:hover:bg-warning-900/50">At Risk</Badge>;
      case 'churned':
        return <Badge className="bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400 hover:bg-danger-200 dark:hover:bg-danger-900/50">Churned</Badge>;
      case 'new':
        return <Badge className="bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900/50">New</Badge>;
      default:
        return null;
    }
  };

  const columns: Column<Client>[] = [
    {
      key: 'select',
      header: (
        <div 
          className="flex items-center justify-center cursor-pointer" 
          onClick={() => onSelectAll()}
          role="checkbox"
          aria-checked={selectedClientIds.length === clients.length && clients.length > 0}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelectAll();
            }
          }}
        >
          {selectedClientIds.length === clients.length && clients.length > 0 ? (
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Square className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
      ),
      cell: (client) => (
        <div 
          className="flex items-center justify-center cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onSelectClient(client.id);
          }}
          role="checkbox"
          aria-checked={selectedClientIds.includes(client.id)}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelectClient(client.id);
            }
          }}
        >
          {selectedClientIds.includes(client.id) ? (
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Square className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
      ),
      className: "w-[40px]"
    },
    {
      key: 'name',
      header: 'Client',
      cell: (client) => <span className="font-medium">{client.name}</span>
    },
    {
      key: 'status',
      header: 'Status',
      cell: (client) => getStatusBadge(client.status)
    },
    {
      key: 'progress',
      header: 'Progress',
      cell: (client) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden dark:bg-gray-700">
            <div 
              className={`h-full ${
                client.progress >= 70 ? 'bg-success-500' : 
                client.progress >= 40 ? 'bg-warning-500' : 
                'bg-danger-500'
              }`}
              style={{ width: `${client.progress}%` }} 
            />
          </div>
          <span className="text-xs">{client.progress}%</span>
        </div>
      )
    },
    {
      key: 'endDate',
      header: 'End Date',
      cell: (client) => (
        <div className="flex flex-col">
          <span>{format(new Date(client.endDate), 'MMM dd, yyyy')}</span>
          <span className="text-xs text-muted-foreground">
            {differenceInDays(new Date(client.endDate), new Date()) < 0 
              ? 'Expired' 
              : `${differenceInDays(new Date(client.endDate), new Date())} days`}
          </span>
        </div>
      )
    },
    {
      key: 'csm',
      header: 'CSM',
      cell: (client) => client.csm || 'Unassigned'
    },
    {
      key: 'callsBooked',
      header: 'Calls Booked',
      cell: (client) => (
        <div className="flex items-center">
          <Phone className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
          <span>{client.callsBooked}</span>
        </div>
      )
    },
    {
      key: 'dealsClosed',
      header: 'Deals Closed',
      cell: (client) => (
        <div className="flex items-center">
          <BarChart2 className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
          <span>{client.dealsClosed}</span>
        </div>
      )
    },
    {
      key: 'mrr',
      header: 'MRR',
      cell: (client) => (
        <div className="flex items-center">
          <DollarSign className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
          <span>${client.mrr}</span>
        </div>
      )
    },
    {
      key: 'nps',
      header: 'NPS',
      cell: (client) => (
        <div className="flex items-center gap-2">
          {client.npsScore !== null ? (
            <Badge className={
              client.npsScore >= 8 ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400" :
              client.npsScore >= 6 ? "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400" :
              "bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400"
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
      )
    },
    {
      key: 'actions',
      header: '',
      cell: (client) => (
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
      ),
      className: "text-right"
    }
  ];

  return (
    <div 
      className="w-full"
      role="region"
      aria-label="Clients Table"
    >
      <VirtualizedTable
        data={clients}
        columns={columns}
        keyExtractor={(client) => client.id}
        emptyMessage="No clients found matching your filters."
        className="border rounded-lg"
        stripedRows
        hoverable
        itemHeight={56}
      />
    </div>
  );
}
