import { Client, getAllClients } from '@/lib/data';
import { calculatePerformanceTrends, generateClientComparisons } from './aiDataAnalyzer';

/**
 * Get complete metrics data for a set of clients
 */
export function getComprehensiveMetrics(clients: Client[] = getAllClients()) {
  // Get status counts
  const statusCounts = calculateStatusCounts(clients);
  
  // Calculate rates
  const rates = calculateRates(statusCounts);
  
  // Calculate trends
  const trends = generateTrendData(rates);
  
  // Calculate other metrics
  const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
  const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
  const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);
  
  return {
    statusCounts,
    rates,
    trends,
    totalMRR,
    totalCallsBooked,
    totalDealsClosed,
    clientCount: clients.length,
    performanceTrends: calculatePerformanceTrends(clients),
    clientComparisons: generateClientComparisons(clients)
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
 * This consolidates multiple functions into a single comprehensive function
 */
export function getTeamPerformanceData(selectedTeam: string, clients: Client[] = getAllClients()) {
  const teamClients = selectedTeam === "all" 
    ? clients 
    : clients.filter(client => client.team === selectedTeam);
  
  return getComprehensiveMetrics(teamClients);
}

// Keep backwards compatibility for legacy code
export function getCompanyMetrics(clients: Client[] = getAllClients()) {
  const metrics = getComprehensiveMetrics(clients);
  return {
    totalMRR: metrics.totalMRR,
    totalCallsBooked: metrics.totalCallsBooked,
    totalDealsClosed: metrics.totalDealsClosed,
    clientCount: metrics.clientCount,
    performanceTrends: metrics.performanceTrends,
    clientComparisons: metrics.clientComparisons
  };
}

// Maintain backwards compatibility for existing components
export function calculateTeamMetrics(team?: string, clients: Client[] = getAllClients()) {
  const teamClients = team && team !== 'all' 
    ? clients.filter(client => client.team === team)
    : clients;

  return {
    ...getCompanyMetrics(teamClients),
    teamClients
  };
}
