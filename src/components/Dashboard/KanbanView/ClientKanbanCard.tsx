
import React from "react";
import { Client } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, BarChart2, DollarSign, ChevronRight, Edit, TrendingUp, Move } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { differenceInDays } from "date-fns";

interface ClientKanbanCardProps {
  client: Client;
  index: number;
  onUpdateNPS: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onViewDetails: (client: Client) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export function ClientKanbanCard({
  client,
  index,
  onUpdateNPS,
  onEditMetrics,
  onViewDetails,
  getStatusColor,
  getStatusLabel
}: ClientKanbanCardProps) {
  
  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Expired';
    return `${days} days`;
  };

  return (
    <Draggable key={client.id} draggableId={client.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 overflow-hidden"
        >
          <Card>
            <div className="p-3 border-b flex items-center justify-between">
              <div className="font-medium flex items-center">
                <Move className="h-3 w-3 mr-2 text-muted-foreground" />
                {client.name}
              </div>
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
                  onClick={() => onViewDetails(client)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
