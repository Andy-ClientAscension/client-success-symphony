
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface TeamAnalyticsHeaderProps {
  selectedTeam: string;
  teams: string[];
  onTeamChange: (value: string) => void;
  onAddTeam: () => void;
  onDeleteTeam: () => void;
}

export function TeamAnalyticsHeader({
  selectedTeam,
  teams,
  onTeamChange,
  onAddTeam,
  onDeleteTeam
}: TeamAnalyticsHeaderProps) {
  const formatTeamName = (team: string): string => {
    if (team === "all") return "All Teams";
    if (team.startsWith("Team-")) {
      return "Team " + team.substring(5);
    }
    return team;
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedTeam} onValueChange={onTeamChange}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Select Team" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Teams</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team} value={team}>
              {formatTeamName(team)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        size="sm"
        variant="outline"
        onClick={onAddTeam}
        className="h-8"
      >
        <PlusCircle className="h-4 w-4 mr-1" /> Add Team
      </Button>
      <Button 
        size="sm"
        variant="outline"
        onClick={onDeleteTeam}
        className="h-8" 
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete Team
      </Button>
    </div>
  );
}
