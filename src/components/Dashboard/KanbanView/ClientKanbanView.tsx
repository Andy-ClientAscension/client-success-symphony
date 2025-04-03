
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Client } from "@/lib/data";
import { KanbanColumn } from "./KanbanColumn";
import { useClientStatus } from "./useClientStatus";
import { getStatusLabel, getStatusColor } from "./ClientStatusHelper";

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
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {Object.entries(clientsByStatus).map(([status, statusClients]) => (
          <KanbanColumn
            key={status}
            status={status}
            clients={statusClients}
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
