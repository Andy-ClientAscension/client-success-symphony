
import { format, differenceInDays } from 'date-fns';
import { Client } from '@/lib/data';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientTable } from './ClientTableContext';
import { CheckSquare, Square, Phone, BarChart2, DollarSign, Edit, TrendingUp, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientRowProps {
  client: Client;
  style?: React.CSSProperties;
}

export function ClientRow({ client, style }: ClientRowProps) {
  const { selectedClientIds, onSelectClient, onViewDetails, onEditMetrics, onUpdateNPS } = useClientTable();
  const isSelected = selectedClientIds.includes(client.id);

  return (
    <TableRow className="absolute w-full" style={style}>
      <TableCell>
        <div 
          className="flex items-center justify-center cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onSelectClient(client.id);
          }}
          role="checkbox"
          aria-checked={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onSelectClient(client.id);
            }
          }}
        >
          {isSelected ? (
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Square className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">{client.name}</span>
      </TableCell>
      <TableCell>
        <Badge variant={
          client.status === 'active' ? 'default' :
          client.status === 'at-risk' ? 'destructive' :
          client.status === 'churned' ? 'secondary' : 'outline'
        }>
          {client.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                client.progress >= 70 ? 'bg-green-500' : 
                client.progress >= 40 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${client.progress}%` }} 
            />
          </div>
          <span className="text-xs">{client.progress}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{format(new Date(client.endDate), 'MMM dd, yyyy')}</span>
          <span className="text-xs text-muted-foreground">
            {differenceInDays(new Date(client.endDate), new Date()) < 0 
              ? 'Expired' 
              : `${differenceInDays(new Date(client.endDate), new Date())} days`}
          </span>
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
            <Badge variant={
              client.npsScore >= 8 ? 'default' :
              client.npsScore >= 6 ? 'secondary' :
              'destructive'
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
          >
            <TrendingUp className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEditMetrics(client);
            }}
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
              <Button variant="ghost" size="icon">
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
                Edit Metrics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateNPS(client)}>
                Update NPS
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
