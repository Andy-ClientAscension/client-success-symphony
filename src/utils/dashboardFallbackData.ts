// Fallback data for dashboard when Supabase is unavailable
export const fallbackClients = [
  {
    id: 'demo-1',
    name: 'Acme Corporation',
    status: 'active',
    mrr: 5000,
    npsScore: 8.5,
    lastContact: '2024-01-15',
    progress: 85,
    created_at: '2024-01-01'
  },
  {
    id: 'demo-2', 
    name: 'Tech Solutions Inc',
    status: 'at-risk',
    mrr: 2500,
    npsScore: 6.2,
    lastContact: '2024-01-10',
    progress: 45,
    created_at: '2024-01-05'
  },
  {
    id: 'demo-3',
    name: 'Global Enterprises',
    status: 'active',
    mrr: 8000,
    npsScore: 9.1,
    lastContact: '2024-01-14',
    progress: 92,
    created_at: '2024-01-03'
  },
  {
    id: 'demo-4',
    name: 'StartupXYZ',
    status: 'new',
    mrr: 1500,
    npsScore: 7.8,
    lastContact: '2024-01-16',
    progress: 65,
    created_at: '2024-01-15'
  },
  {
    id: 'demo-5',
    name: 'Enterprise Systems',
    status: 'churned',
    mrr: 0,
    npsScore: 4.2,
    lastContact: '2024-01-01',
    progress: 15,
    created_at: '2023-12-15'
  }
];

export const fallbackMetrics = {
  totalMRR: 17000,
  totalCallsBooked: 24,
  totalDealsClosed: 8,
  avgHealthScore: 7.6,
  retentionRate: 85,
  churnRate: 8.5
};

export const fallbackStatusCounts = {
  active: 2,
  'at-risk': 1, 
  new: 1,
  churned: 1,
  total: 5
};

export const fallbackRates = {
  churnRate: 8.5,
  retentionRate: 85,
  atRiskRate: 20
};