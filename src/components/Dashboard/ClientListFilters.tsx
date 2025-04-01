
import { Search, Users, Download, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToCSV } from "@/utils/exportUtils";
import { Client } from "@/lib/data";

const TEAMS = [
  { id: "all", name: "All Teams" },
  { id: "Team-Andy", name: "Team Andy" },
  { id: "Team-Chris", name: "Team Chris" },
  { id: "Team-Alex", name: "Team Alex" },
  { id: "Team-Cillin", name: "Team Cillin" },
];

interface ClientListFiltersProps {
  selectedTeam: string;
  searchQuery: string;
  onTeamChange: (team: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredClients: Client[];
  onAddNewClient: () => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
}

export function ClientListFilters({
  selectedTeam,
  searchQuery,
  onTeamChange,
  onSearchChange,
  filteredClients,
  onAddNewClient,
  itemsPerPage = 25,
  onItemsPerPageChange
}: ClientListFiltersProps) {
  const handleExportCSV = () => {
    const csvData = filteredClients.map(client => ({
      "Client Name": client.name,
      "Status": client.status,
      "Progress": client.progress,
      "End Date": client.endDate,
      "CSM": client.csm,
      "Calls Booked": client.callsBooked,
      "Deals Closed": client.dealsClosed,
      "MRR": client.mrr,
      "NPS": client.npsScore !== null ? client.npsScore : 'N/A'
    }));

    exportToCSV(csvData, "client_overview");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedTeam} onValueChange={onTeamChange}>
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
      
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <Select 
            value={String(itemsPerPage)} 
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Show" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button 
        onClick={handleExportCSV}
        variant="outline"
        size="sm"
        className="flex gap-1 h-8 text-xs"
        title="Export to CSV"
      >
        <Download className="h-3 w-3" /> Export
      </Button>
      <Button 
        onClick={onAddNewClient}
        className="bg-red-600 hover:bg-red-700"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
      </Button>
    </div>
  );
}
