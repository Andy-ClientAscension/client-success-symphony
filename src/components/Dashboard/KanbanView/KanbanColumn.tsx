
import React from "react";
import { Client } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Droppable } from "@hello-pangea/dnd";
import { ClientKanbanCard } from "./ClientKanbanCard";

interface KanbanColumnProps {
  status: string;
  clients: Client[];
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  onUpdateNPS: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onViewDetails: (client: Client) => void;
}

export function KanbanColumn({
  status,
  clients,
  getStatusColor,
  getStatusLabel,
  onUpdateNPS,
  onEditMetrics,
  onViewDetails
}: KanbanColumnProps) {
  return (
    <div className="bg-card rounded-lg p-3 border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{getStatusLabel(status)}</h3>
        <Badge className={getStatusColor(status)}>{clients.length}</Badge>
      </div>
      <Droppable droppableId={status}>
        {(provided) => (
          <div 
            className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {clients.map((client, index) => (
              <ClientKanbanCard
                key={client.id}
                client={client}
                index={index}
                onUpdateNPS={onUpdateNPS}
                onEditMetrics={onEditMetrics}
                onViewDetails={onViewDetails}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
