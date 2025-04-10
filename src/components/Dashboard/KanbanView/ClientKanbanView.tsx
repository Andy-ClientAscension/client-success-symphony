
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Client } from "@/lib/data";
import { KanbanColumn } from "./KanbanColumn";
import { useClientStatus } from "./useClientStatus";
import { getStatusLabel, getStatusColor, getDefaultColumnOrder } from "./ClientStatusHelper";

interface ClientKanbanViewProps {
  clients: Client[];
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
}

export function ClientKanbanView({ clients, onEditMetrics, onUpdateNPS }: ClientKanbanViewProps) {
  const navigate = useNavigate();
  const { clientsByStatus, handleDragEnd } = useClientStatus(clients);
  
  const handleViewDetails = (client: Client) => {
    navigate(`/client/${client.id}`);
  };
  
  // Use the predefined column order
  const columnOrder = getDefaultColumnOrder();
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 overflow-x-auto">
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
    </DragDropContext>
  );
}
