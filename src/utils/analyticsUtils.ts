
import { Client, getAllClients } from '@/lib/data';
import { calculatePerformanceTrends, generateClientComparisons } from './aiDataAnalyzer';

/**
 * Get basic company metrics from a set of clients
 */
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

/**
 * Calculate metrics for a specific team or all clients
 */
export function calculateTeamMetrics(team?: string, clients: Client[] = getAllClients()) {
  const teamClients = team && team !== 'all' 
    ? clients.filter(client => client.team === team)
    : clients;

  return {
    ...getCompanyMetrics(teamClients),
    teamClients
  };
}

/**
 * Calculate status counts based on client statuses
 */
export function calculateStatusCounts(clients: Client[]) {
  return {
    active: clients.filter(client => client.status === 'active').length,
    atRisk: clients.filter(client => client.status === 'at-risk').length,
    churned: clients.filter(client => client.status === 'churned').length,
    new: clients.filter(client => client.status === 'new').length,
    total: clients.length
  };
}

/**
 * Calculate retention, at-risk, and churn rates from status counts
 */
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

/**
 * Generate trend data comparing current rates with previous period rates
 */
export function generateTrendData(rates: ReturnType<typeof calculateRates>) {
  // Simulate previous period data (would come from actual historical data in production)
  const prevPeriodRetention = Math.max(0, Math.round(rates.retentionRate - (Math.random() * 10 - 5)));
  const prevPeriodAtRisk = Math.max(0, Math.round(rates.atRiskRate - (Math.random() * 10 - 3)));
  const prevPeriodChurn = Math.max(0, Math.round(rates.churnRate - (Math.random() * 10 - 2)));

  return {
    retentionTrend: rates.retentionRate - prevPeriodRetention,
    atRiskTrend: rates.atRiskRate - prevPeriodAtRisk,
    churnTrend: rates.churnRate - prevPeriodChurn
  };
}

/**
 * Get complete team performance data for analytics
 */
export function getTeamPerformanceData(selectedTeam: string, clients: Client[]) {
  const teamClients = selectedTeam === "all" 
    ? clients 
    : clients.filter(client => client.team === selectedTeam);
  
  const statusCounts = calculateStatusCounts(teamClients);
  const rates = calculateRates(statusCounts);
  const trends = generateTrendData(rates);
  const metrics = getCompanyMetrics(teamClients);
  
  return {
    teamClients,
    statusCounts,
    rates,
    trends,
    metrics
  };
}
