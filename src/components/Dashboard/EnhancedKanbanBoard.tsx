
import { useState, useMemo } from "react";
import { ClientKanbanView } from "./KanbanView/ClientKanbanView";
import { Client } from "@/lib/data";
import { ClientMetricsForm } from "./ClientMetricsForm";
import { NPSUpdateForm } from "./NPSUpdateForm";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

interface EnhancedKanbanBoardProps {
  fullScreen?: boolean;
  clients?: Client[];
}

export function EnhancedKanbanBoard({ fullScreen = false, clients = [] }: EnhancedKanbanBoardProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isNPSModalOpen, setIsNPSModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("all");
  
  // Filter clients based on selected team
  const filteredClients = useMemo(() => {
    if (selectedTeam === "all") return clients;
    return clients.filter(client => 
      (client.team || "").toLowerCase() === selectedTeam.toLowerCase()
    );
  }, [clients, selectedTeam]);
  
  // Memoize these handlers to prevent unnecessary re-renders
  const handleEditMetrics = useMemo(() => (client: Client) => {
    setSelectedClient(client);
    setIsMetricsModalOpen(true);
  }, []);
  
  const handleUpdateNPS = useMemo(() => (client: Client) => {
    setSelectedClient(client);
    setIsNPSModalOpen(true);
  }, []);
  
  // Memoize the metrics submission handler
  const handleMetricsSubmit = useMemo(() => (data: any) => {
    console.log("Metrics updated:", data);
    setIsMetricsModalOpen(false);
  }, []);

  // Team options for the select dropdown
  const TEAMS = [
    { id: "all", name: "All Teams" },
    { id: "Team-Andy", name: "Team Andy" },
    { id: "Team-Chris", name: "Team Chris" },
    { id: "Team-Alex", name: "Team Alex" },
    { id: "Team-Cillin", name: "Team Cillin" },
    { id: "Enterprise", name: "Enterprise" },
    { id: "SMB", name: "SMB" },
    { id: "Mid-Market", name: "Mid Market" },
  ];
  
  return (
    <div className={`bg-white rounded-lg shadow ${fullScreen ? 'p-6' : 'p-2'}`}>
      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              {TEAMS.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <ClientKanbanView 
        clients={filteredClients} 
        onEditMetrics={handleEditMetrics}
        onUpdateNPS={handleUpdateNPS}
      />
      
      {selectedClient && isMetricsModalOpen && (
        <ClientMetricsForm
          isOpen={isMetricsModalOpen}
          onClose={() => setIsMetricsModalOpen(false)}
          onSubmit={handleMetricsSubmit}
          clientName={selectedClient.name}
          initialData={{
            callsBooked: selectedClient.callsBooked || 0,
            dealsClosed: selectedClient.dealsClosed || 0,
            mrr: selectedClient.mrr || 0
          }}
        />
      )}
      
      {selectedClient && isNPSModalOpen && (
        <NPSUpdateForm
          isOpen={isNPSModalOpen}
          onClose={() => setIsNPSModalOpen(false)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          currentScore={selectedClient.npsScore || 0}
        />
      )}
    </div>
  );
}
