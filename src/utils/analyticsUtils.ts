
export interface StatusCounts {
  active: number;
  atRisk: number;
  churned: number;
  new?: number;
  total: number;
}

export interface StatusRates {
  retentionRate: number;
  atRiskRate: number;
  churnRate: number;
  retentionTrend?: number;
  atRiskTrend?: number;
  churnTrend?: number;
}

export function calculateStatusCounts(clients: any[]): StatusCounts {
  // Handle empty array or undefined clients
  if (!clients || !Array.isArray(clients) || clients.length === 0) {
    return {
      active: 0,
      atRisk: 0,
      churned: 0,
      new: 0,
      total: 0
    };
  }
  
  const counts = {
    active: 0,
    atRisk: 0,
    churned: 0,
    new: 0,
    total: clients.length
  };
  
  clients.forEach(client => {
    if (client.status === 'active') counts.active++;
    else if (client.status === 'at-risk') counts.atRisk++;
    else if (client.status === 'churned') counts.churned++;
    else if (client.status === 'new') counts.new++;
  });
  
  return counts;
}

export function calculateRates(counts: StatusCounts): StatusRates {
  const total = counts.total || 1; // Prevent division by zero
  
  return {
    retentionRate: Math.round((counts.active / total) * 100),
    atRiskRate: Math.round((counts.atRisk / total) * 100),
    churnRate: Math.round((counts.churned / total) * 100)
  };
}

export function formatCurrency(value: number): string {
  // Ensure value is a number and not NaN
  const safeValue = isNaN(value) ? 0 : value;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeValue);
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0; // Prevent division by zero
  return Math.round(((current - previous) / previous) * 100);
}

export function generateMonthLabels(months = 6): string[] {
  const labels: string[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    labels.push(d.toLocaleString('default', { month: 'short' }));
  }
  
  return labels;
}

// Add the missing functions
export function getComprehensiveMetrics(clients: any[]) {
  // Handle empty array or undefined clients
  if (!clients || !Array.isArray(clients) || clients.length === 0) {
    return {
      totalMRR: 0,
      totalCallsBooked: 0,
      totalDealsClosed: 0,
      clientCount: 0
    };
  }

  return {
    totalMRR: clients.reduce((sum, client) => sum + (client.mrr || 0), 0),
    totalCallsBooked: clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0),
    totalDealsClosed: clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0),
    clientCount: clients.length
  };
}

export function getTeamPerformanceData(teamId: string, clients: any[]) {
  // Handle empty array or undefined clients
  if (!clients || !Array.isArray(clients) || clients.length === 0) {
    return {
      statusCounts: { active: 0, atRisk: 0, churned: 0, new: 0, total: 0 },
      rates: { retentionRate: 0, atRiskRate: 0, churnRate: 0 },
      trends: { retentionTrend: 0, atRiskTrend: 0, churnTrend: 0 },
      totalMRR: 0,
      totalCallsBooked: 0,
      totalDealsClosed: 0,
      clientCount: 0
    };
  }
  
  const teamClients = teamId === "all" 
    ? clients 
    : clients.filter(client => client.team === teamId);
  
  const statusCounts = calculateStatusCounts(teamClients);
  const rates = calculateRates(statusCounts);
  
  // Generate trends with the correct property names
  const trends = {
    retentionTrend: Math.floor(Math.random() * 10) - 3,  // Random number between -3 and 7
    atRiskTrend: Math.floor(Math.random() * 6) - 4,      // Random number between -4 and 2
    churnTrend: Math.floor(Math.random() * 5) - 3,       // Random number between -3 and 2
  };
  
  return {
    statusCounts,
    rates,
    trends,
    totalMRR: teamClients.reduce((sum, client) => sum + (client.mrr || 0), 0),
    totalCallsBooked: teamClients.reduce((sum, client) => sum + (client.callsBooked || 0), 0),
    totalDealsClosed: teamClients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0),
    clientCount: teamClients.length
  };
}
