
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
import { focusRingClasses } from '@/lib/accessibility';

interface ClientRowProps {
  client: Client;
  style?: React.CSSProperties;
}

export function ClientRow({ client, style }: ClientRowProps) {
  const { selectedClientIds, onSelectClient, onViewDetails, onEditMetrics, onUpdateNPS } = useClientTable();
  const isSelected = selectedClientIds.includes(client.id);

  return (
    <TableRow 
      className="absolute w-full" 
      style={style}
      data-state={isSelected ? "selected" : "unselected"}
      data-id={client.id}
      aria-selected={isSelected}
    >
      <TableCell>
        <div 
          className={`flex items-center justify-center cursor-pointer ${focusRingClasses}`} 
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
          <span className="sr-only">
            {isSelected ? `Unselect ${client.name}` : `Select ${client.name}`}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">{client.name}</span>
      </TableCell>
      <TableCell>
        <Badge 
          variant={
            client.status === 'active' ? 'default' :
            client.status === 'at-risk' ? 'destructive' :
            client.status === 'churned' ? 'secondary' : 'outline'
          }
        >
          {client.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div 
            className="w-24 h-2 bg-muted rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={client.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
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
          <Phone className="h-3 w-3 mr-1 text-red-600" aria-hidden="true" />
          <span>{client.callsBooked}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <BarChart2 className="h-3 w-3 mr-1 text-red-600" aria-hidden="true" />
          <span>{client.dealsClosed}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <DollarSign className="h-3 w-3 mr-1 text-red-600" aria-hidden="true" />
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
            className={`h-6 w-6 ${focusRingClasses}`}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateNPS(client);
            }}
            aria-label={`Update NPS score for ${client.name}`}
          >
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className={focusRingClasses}
            onClick={(e) => {
              e.stopPropagation();
              onEditMetrics(client);
            }}
            aria-label={`Edit metrics for ${client.name}`}
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className={focusRingClasses}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(client);
            }}
            aria-label={`View details for ${client.name}`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={focusRingClasses} aria-label={`More options for ${client.name}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-white dark:bg-gray-800">
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
