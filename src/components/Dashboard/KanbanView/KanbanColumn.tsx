
import React from "react";
import { Client } from "@/lib/data";
import { ClientKanbanCard } from "./ClientKanbanCard";
import { Droppable } from "@hello-pangea/dnd";

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
    <div className="flex flex-col h-full">
      <div className={`px-3 py-2 ${getStatusColor(status)} rounded-t-md`}>
        <h3 className="font-medium text-sm flex items-center justify-between">
          <span>{getStatusLabel(status)}</span>
          <span className="bg-white bg-opacity-30 px-2 rounded-full text-xs">
            {clients.length}
          </span>
        </h3>
      </div>
      
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 p-2 bg-muted/30 min-h-[200px] rounded-b-md"
          >
            {clients.map((client, index) => (
              <ClientKanbanCard
                key={client.id}
                client={client}
                index={index}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                onUpdateNPS={onUpdateNPS}
                onEditMetrics={onEditMetrics}
                onViewDetails={onViewDetails}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
