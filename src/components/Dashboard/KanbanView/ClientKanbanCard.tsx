
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

  const handleUpdateNPS = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNPS(client);
  };

  const handleEditMetrics = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditMetrics(client);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(client);
  };

  return (
    <Draggable key={client.id} draggableId={client.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2 overflow-hidden"
          onClick={handleViewDetails}
        >
          <Card className="shadow-sm hover:shadow transition-shadow cursor-pointer">
            <div className="p-2 border-b flex items-center justify-between">
              <div className="font-medium flex items-center text-sm truncate max-w-[75%]">
                <Move className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
                {client.name}
              </div>
              <Badge className={`${getStatusColor(client.status)} text-xs px-1.5 py-0.5`}>
                {getStatusLabel(client.status)}
              </Badge>
            </div>
            <CardContent className="p-2 space-y-2">
              {/* Enhanced client information */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="truncate max-w-[60%]">CSM: {client.csm || 'Unassigned'}</span>
                <span>{getDaysRemaining(client.endDate)}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
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
              
              {/* Progress indicator */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Progress</span>
                  <span>{client.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      client.progress >= 70 ? 'bg-success-500' :
                      client.progress >= 40 ? 'bg-warning-500' :
                      'bg-danger-500'
                    }`}
                    style={{ width: `${client.progress}%` }}
                  />
                </div>
              </div>
              
              {/* NPS Score if available */}
              {client.npsScore !== null && (
                <div className="flex items-center justify-between text-xs">
                  <span>NPS Score:</span>
                  <Badge variant={
                    client.npsScore >= 8 ? 'default' :
                    client.npsScore >= 6 ? 'secondary' :
                    'destructive'
                  }>
                    {client.npsScore}
                  </Badge>
                </div>
              )}
              
              <div className="flex gap-1 justify-end mt-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleUpdateNPS}
                  title="Update NPS"
                  aria-label="Update NPS score"
                >
                  <TrendingUp className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleEditMetrics}
                  title="Edit metrics"
                  aria-label="Edit client metrics"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleViewDetails}
                  aria-label="View client details"
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
