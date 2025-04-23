
import { useState, useMemo, useEffect } from "react";
import { getAllClients, getCSMList, getClientMetricsByTeam } from "@/lib/data";
import { ADDITIONAL_TEAMS } from "../constants";

export function useTeamData(externalSelectedTeam?: string) {
  const [selectedTeam, setSelectedTeam] = useState<string>(externalSelectedTeam || "all");
  const [teams, setTeams] = useState<string[]>([]);
  
  const clients = useMemo(() => getAllClients(), []);
  const csmList = useMemo(() => getCSMList(), []);
  
  const teamSet = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(client => {
      if (client.team) {
        set.add(client.team);
      }
    });
    ADDITIONAL_TEAMS.forEach(team => set.add(team.id));
    return set;
  }, [clients]);
  
  useEffect(() => {
    setTeams(Array.from(teamSet));
  }, [teamSet]);
  
  useEffect(() => {
    if (externalSelectedTeam) {
      setSelectedTeam(externalSelectedTeam);
    }
  }, [externalSelectedTeam]);
  
  const teamClients = useMemo(() => {
    return selectedTeam === "all" 
      ? clients 
      : clients.filter(client => client.team === selectedTeam);
  }, [clients, selectedTeam]);
  
  const metrics = useMemo(() => getClientMetricsByTeam(), []);
  const teamMetrics = useMemo(() => {
    return selectedTeam === "all" ? metrics : getClientMetricsByTeam(selectedTeam);
  }, [metrics, selectedTeam]);

  return {
    selectedTeam,
    setSelectedTeam,
    teams,
    setTeams,
    clients,
    csmList,
    teamClients,
    teamMetrics
  };
}
