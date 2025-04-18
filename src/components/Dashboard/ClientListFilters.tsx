import { Client } from "@/lib/data";
import { UnifiedFilter } from "./Shared/UnifiedFilter";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/utils/exportUtils";
import React from "react";

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

const TEAMS = [
  "all",
  "Team-Andy",
  "Team-Chris",
  "Team-Alex",
  "Team-Cillin",
  "Enterprise",
  "SMB",
  "Mid-Market",
];

export function ClientListFilters({
  selectedTeam,
  searchQuery,
  onTeamChange,
  onSearchChange,
  filteredClients,
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
    <div className="flex flex-col gap-4">
      <UnifiedFilter
        selectedTeam={selectedTeam}
        teams={TEAMS}
        onTeamChange={onTeamChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showTeamFilter={true}
        showSearch={true}
        additionalFilters={
          <>
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex gap-1 h-8 text-xs"
              title="Export to CSV"
            >
              <Download className="h-3 w-3" /> Export
            </Button>
          </>
        }
      />
    </div>
  );
}
