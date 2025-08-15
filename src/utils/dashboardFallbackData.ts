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
    created_at: '2024-01-01',
    riskLevel: 'low',
    paymentStatus: 'paid',
    contractType: 'annually'
  },
  {
    id: 'demo-2', 
    name: 'Tech Solutions Inc',
    status: 'caution',
    mrr: 2500,
    npsScore: 6.2,
    lastContact: '2024-01-10',
    progress: 45,
    created_at: '2024-01-05',
    riskLevel: 'medium',
    paymentStatus: 'unpaid',
    contractType: 'quarterly'
  },
  {
    id: 'demo-3',
    name: 'Global Enterprises',
    status: 'active',
    mrr: 8000,
    npsScore: 9.1,
    lastContact: '2024-01-14',
    progress: 92,
    created_at: '2024-01-03',
    riskLevel: 'low',
    paymentStatus: 'paid',
    contractType: 'annually'
  },
  {
    id: 'demo-4',
    name: 'StartupXYZ',
    status: 'new',
    mrr: 1500,
    npsScore: 7.8,
    lastContact: '2024-01-16',
    progress: 65,
    created_at: '2024-01-15',
    riskLevel: 'medium',
    paymentStatus: 'paid',
    contractType: 'monthly'
  },
  {
    id: 'demo-5',
    name: 'Enterprise Systems',
    status: 'not-active',
    mrr: 0,
    npsScore: 4.2,
    lastContact: '2024-01-01',
    progress: 15,
    created_at: '2023-12-15',
    riskLevel: 'high',
    paymentStatus: 'overdue',
    contractType: 'monthly'
  },
  {
    id: 'demo-6',
    name: 'Digital Dynamics',
    status: 'at-risk',
    mrr: 3200,
    npsScore: 5.8,
    lastContact: '2024-01-12',
    progress: 35,
    created_at: '2024-01-08',
    riskLevel: 'high',
    paymentStatus: 'unpaid',
    contractType: 'quarterly'
  },
  {
    id: 'demo-7',
    name: 'Innovation Labs',
    status: 'paused',
    mrr: 1800,
    npsScore: 7.0,
    lastContact: '2024-01-11',
    progress: 55,
    created_at: '2024-01-02',
    riskLevel: 'medium',
    paymentStatus: 'paid',
    contractType: 'monthly'
  },
  {
    id: 'demo-8',
    name: 'Future Corp',
    status: 'graduated',
    mrr: 6500,
    npsScore: 9.5,
    lastContact: '2024-01-17',
    progress: 98,
    created_at: '2023-12-20',
    riskLevel: 'low',
    paymentStatus: 'paid',
    contractType: 'annually'
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