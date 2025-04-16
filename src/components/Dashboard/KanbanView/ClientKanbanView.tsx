
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Client } from "@/lib/data";
import { KanbanColumn } from "./KanbanColumn";
import { useClientStatus } from "./useClientStatus";
import { getStatusLabel, getStatusColor, getDefaultColumnOrder } from "./ClientStatusHelper";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClientKanbanViewProps {
  clients: Client[];
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

export function ClientKanbanView({ clients, onEditMetrics, onUpdateNPS }: ClientKanbanViewProps) {
  const navigate = useNavigate();
  const { clientsByStatus, handleDragEnd } = useClientStatus(clients);
  
  const handleViewDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };
  
  // Use the predefined column order
  const columnOrder = getDefaultColumnOrder();
  
  console.log("ClientKanbanView received clients:", clients.length);
  console.log("ClientKanbanView using columns:", columnOrder);
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ScrollArea className="w-full h-[calc(100vh-240px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2 pb-4 min-w-full">
          {columnOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              clients={clientsByStatus[status] || []}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              onUpdateNPS={onUpdateNPS}
              onEditMetrics={onEditMetrics}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </ScrollArea>
    </DragDropContext>
  );
}
