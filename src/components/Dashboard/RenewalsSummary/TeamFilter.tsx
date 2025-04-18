
import { Users } from "lucide-react";
import { UnifiedFilter } from "../Shared/UnifiedFilter";

interface TeamFilterProps {
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  teams: string[];
  formatTeamName: (team: string) => string;
}

export function TeamFilter({ selectedTeam, setSelectedTeam, teams, formatTeamName }: TeamFilterProps) {
  const formattedTeams = teams.map(team => ({
    value: team,
    label: formatTeamName(team)
  }));
  
  return (
    <UnifiedFilter
      selectedTeam={selectedTeam}
      teams={teams}
      onTeamChange={setSelectedTeam}
      showTeamFilter={true}
      showDateFilter={false}
      showSearch={false}
      showSort={false}
    />
  );
}
