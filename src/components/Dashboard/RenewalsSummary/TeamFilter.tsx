
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface TeamFilterProps {
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  teams: string[];
  formatTeamName: (team: string) => string;
}

export function TeamFilter({ selectedTeam, setSelectedTeam, teams, formatTeamName }: TeamFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedTeam} onValueChange={setSelectedTeam}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team} value={team}>
              {formatTeamName(team)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
