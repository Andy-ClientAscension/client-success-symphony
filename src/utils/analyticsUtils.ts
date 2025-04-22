
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
  return {
    retentionRate: counts.total > 0 ? Math.round((counts.active / counts.total) * 100) : 0,
    atRiskRate: counts.total > 0 ? Math.round((counts.atRisk / counts.total) * 100) : 0,
    churnRate: counts.total > 0 ? Math.round((counts.churned / counts.total) * 100) : 0
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
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
