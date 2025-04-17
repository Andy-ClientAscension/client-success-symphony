
import { Client, getAllClients } from '@/lib/data';
import { calculatePerformanceTrends, generateClientComparisons } from './aiDataAnalyzer';

export function getCompanyMetrics(clients: Client[] = getAllClients()) {
  return {
    totalMRR: clients.reduce((sum, client) => sum + (client.mrr || 0), 0),
    totalCallsBooked: clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0),
    totalDealsClosed: clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0),
    clientCount: clients.length,
    performanceTrends: calculatePerformanceTrends(clients),
    clientComparisons: generateClientComparisons(clients)
  };
}

export function calculateTeamMetrics(team?: string, clients: Client[] = getAllClients()) {
  const teamClients = team && team !== 'all' 
    ? clients.filter(client => client.team === team)
    : clients;

  return {
    ...getCompanyMetrics(teamClients),
    teamClients
  };
}

export function calculateStatusCounts(clients: Client[]) {
  return {
    active: clients.filter(client => client.status === 'active').length,
    atRisk: clients.filter(client => client.status === 'at-risk').length,
    churned: clients.filter(client => client.status === 'churned').length,
    new: clients.filter(client => client.status === 'new').length,
    total: clients.length
  };
}

export function calculateRates(statusCounts: ReturnType<typeof calculateStatusCounts>) {
  return {
    retentionRate: statusCounts.total > 0 
      ? Math.round((statusCounts.active / statusCounts.total) * 100) 
      : 0,
    atRiskRate: statusCounts.total > 0 
      ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) 
      : 0,
    churnRate: statusCounts.total > 0 
      ? Math.round((statusCounts.churned / statusCounts.total) * 100) 
      : 0
  };
}
