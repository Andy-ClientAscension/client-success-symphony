import { format, addDays, subDays } from "date-fns";

export interface Client {
  id: string;
  name: string;
  status: "new" | "active" | "at-risk" | "churned";
  team?: string;
  csm?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  notes?: string;
}

export const CSM_TEAMS = [
  { id: "all", name: "All Teams" },
  { id: "enterprise", name: "Enterprise" },
  { id: "mid-market", name: "Mid-Market" },
  { id: "smb", name: "Small Business" },
];

export const CLIENTS: Client[] = [
  {
    id: "1",
    name: "Acme Corporation",
    status: "active",
    team: "enterprise",
    csm: "John Smith",
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    contractValue: 50000,
    notes: "Key enterprise client with multiple product lines"
  },
  {
    id: "2",
    name: "Globex Industries",
    status: "at-risk",
    team: "mid-market",
    csm: "Jane Doe",
    startDate: "2022-11-15",
    endDate: "2023-11-15",
    contractValue: 25000,
    notes: "Renewal discussions needed, showing signs of churn"
  },
  {
    id: "3",
    name: "Initech Software",
    status: "new",
    team: "smb",
    csm: "David Johnson",
    startDate: "2023-05-01",
    endDate: "2023-11-01",
    contractValue: 10000,
    notes: "New client, needs onboarding assistance"
  },
  {
    id: "4",
    name: "Massive Dynamic",
    status: "active",
    team: "enterprise",
    csm: "Sarah Williams",
    startDate: "2023-02-15",
    endDate: "2024-02-15",
    contractValue: 75000,
    notes: "Expansion opportunity in Q4"
  },
  {
    id: "5",
    name: "Stark Industries",
    status: "churned",
    team: "mid-market",
    csm: "Michael Brown",
    startDate: "2022-08-01",
    endDate: "2023-08-01",
    contractValue: 30000,
    notes: "Churned due to budget constraints"
  },
  {
    id: "6",
    name: "Wayne Enterprises",
    status: "active",
    team: "enterprise",
    csm: "John Smith",
    startDate: "2023-03-15",
    endDate: "2024-03-15",
    contractValue: 65000,
    notes: "Strategic partner with multiple departments using our platform"
  },
  {
    id: "7",
    name: "Umbrella Corporation",
    status: "at-risk",
    team: "enterprise",
    csm: "Sarah Williams",
    startDate: "2022-10-01",
    endDate: "2023-10-01",
    contractValue: 55000,
    notes: "Usage declining in last quarter, needs intervention"
  },
  {
    id: "8",
    name: "Cyberdyne Systems",
    status: "new",
    team: "mid-market",
    csm: "Jane Doe",
    startDate: "2023-06-01",
    endDate: "2024-06-01",
    contractValue: 28000,
    notes: "Recently migrated from competitor, needs extra support"
  },
  {
    id: "9",
    name: "Soylent Corp",
    status: "active",
    team: "smb",
    csm: "David Johnson",
    startDate: "2023-01-15",
    endDate: "2024-01-15",
    contractValue: 12000,
    notes: "Growing startup with expansion potential"
  },
  {
    id: "10",
    name: "Oscorp Industries",
    status: "churned",
    team: "mid-market",
    csm: "Michael Brown",
    startDate: "2022-09-15",
    endDate: "2023-03-15",
    contractValue: 22000,
    notes: "Churned due to acquisition by competitor"
  },
  {
    id: "11",
    name: "Hooli",
    status: "active",
    team: "enterprise",
    csm: "John Smith",
    startDate: "2022-12-01",
    endDate: "2023-12-01",
    contractValue: 85000,
    notes: "Key account with multiple product integrations"
  },
  {
    id: "12",
    name: "Pied Piper",
    status: "new",
    team: "smb",
    csm: "Sarah Williams",
    startDate: "2023-07-01",
    endDate: "2024-01-01",
    contractValue: 15000,
    notes: "Innovative startup with rapid growth potential"
  },
  {
    id: "13",
    name: "Dunder Mifflin",
    status: "at-risk",
    team: "mid-market",
    csm: "Jane Doe",
    startDate: "2022-11-01",
    endDate: "2023-11-01",
    contractValue: 32000,
    notes: "Struggling with adoption, needs training"
  },
  {
    id: "14",
    name: "Los Pollos Hermanos",
    status: "active",
    team: "smb",
    csm: "David Johnson",
    startDate: "2023-02-01",
    endDate: "2024-02-01",
    contractValue: 18000,
    notes: "Expanding to new locations, opportunity for upsell"
  },
  {
    id: "15",
    name: "Gekko & Co",
    status: "churned",
    team: "enterprise",
    csm: "Michael Brown",
    startDate: "2022-07-15",
    endDate: "2023-07-15",
    contractValue: 70000,
    notes: "Churned due to internal restructuring"
  },
  {
    id: "16",
    name: "Enterprise Solutions Inc.",
    status: "active",
    team: "enterprise",
    csm: "Michael Wilson",
    startDate: "2023-02-15",
    endDate: "2024-02-15",
    contractValue: 25000,
    notes: "Large enterprise client with complex needs"
  },
  {
    id: "17",
    name: "Digital Marketing Pro",
    status: "new",
    team: "smb",
    csm: "Sarah Lee",
    startDate: "2023-07-01",
    endDate: "2024-01-01",
    contractValue: 7500,
    notes: "New client transitioning from competitor"
  },
  {
    id: "18",
    name: "Healthcare Solutions Group",
    status: "active",
    team: "enterprise",
    csm: "James Thompson",
    startDate: "2022-11-30",
    endDate: "2023-11-30",
    contractValue: 32000,
    notes: "Healthcare industry, requires HIPAA compliance"
  },
  {
    id: "19",
    name: "Urban Design Studio",
    status: "at-risk",
    team: "smb",
    csm: "Emily Chen",
    startDate: "2023-01-15",
    endDate: "2023-07-15",
    contractValue: 6800,
    notes: "Experiencing budget constraints, needs attention"
  },
  {
    id: "20",
    name: "Global Logistics Partners",
    status: "active",
    team: "mid-market",
    csm: "Robert Davis",
    startDate: "2022-09-01",
    endDate: "2023-09-01",
    contractValue: 18500,
    notes: "International shipping company with good growth potential"
  },
  {
    id: "21",
    name: "Modern Educational Systems",
    status: "new",
    team: "mid-market",
    csm: "Laura Garcia",
    startDate: "2023-06-10",
    endDate: "2024-06-10",
    contractValue: 15000,
    notes: "Educational technology company, needs implementation support"
  },
  {
    id: "22",
    name: "Apex Financial Services",
    status: "active",
    team: "enterprise",
    csm: "Daniel Parker",
    startDate: "2022-12-15",
    endDate: "2023-12-15",
    contractValue: 28000,
    notes: "Financial services client with regulatory requirements"
  },
  {
    id: "23",
    name: "Pacific Northwest Retailers",
    status: "at-risk",
    team: "mid-market",
    csm: "Jessica Wong",
    startDate: "2023-03-01",
    endDate: "2024-03-01",
    contractValue: 16500,
    notes: "Experiencing integration issues, needs technical support"
  },
  {
    id: "24",
    name: "Quantum Computing Labs",
    status: "active",
    team: "enterprise",
    csm: "Alex Johnson",
    startDate: "2023-01-01",
    endDate: "2025-01-01",
    contractValue: 45000,
    notes: "Long-term contract with innovative technology company"
  },
  {
    id: "25",
    name: "Sustainable Energy Collective",
    status: "new",
    team: "smb",
    csm: "Sophia Martinez",
    startDate: "2023-08-15",
    endDate: "2024-02-15",
    contractValue: 8900,
    notes: "Green energy startup with ambitious growth plans"
  }
];

// Helper functions for data access
export function getClientsCountByStatus() {
  const counts = {
    active: 0,
    "at-risk": 0,
    new: 0,
    churned: 0
  };
  
  CLIENTS.forEach(client => {
    counts[client.status]++;
  });
  
  return counts;
}

export function getAverageNPS() {
  // Simulate NPS data
  return {
    current: 42,
    previous: 38,
    change: 4,
    trend: "up"
  };
}

export function getClientMetricsByTeam() {
  // Simulate metrics by team
  return {
    enterprise: {
      revenue: 325000,
      clients: 5,
      churnRate: 0.05
    },
    "mid-market": {
      revenue: 123500,
      clients: 4,
      churnRate: 0.08
    },
    smb: {
      revenue: 63700,
      clients: 6,
      churnRate: 0.12
    }
  };
}

export function getRecentActivity() {
  const today = new Date();
  
  return [
    {
      id: "act1",
      type: "meeting",
      client: "Acme Corporation",
      description: "Quarterly Business Review",
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      user: "John Smith"
    },
    {
      id: "act2",
      type: "email",
      client: "Globex Industries",
      description: "Sent renewal proposal",
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      user: "Jane Doe"
    },
    {
      id: "act3",
      type: "call",
      client: "Initech Software",
      description: "Onboarding call",
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      user: "David Johnson"
    },
    {
      id: "act4",
      type: "meeting",
      client: "Massive Dynamic",
      description: "Product roadmap discussion",
      date: format(subDays(today, 7), "yyyy-MM-dd"),
      user: "Sarah Williams"
    },
    {
      id: "act5",
      type: "email",
      client: "Wayne Enterprises",
      description: "Feature request follow-up",
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      user: "John Smith"
    }
  ];
}

export function getUpcomingRenewals() {
  return CLIENTS.filter(client => {
    const endDate = new Date(client.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0 && client.status !== "churned";
  }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
}
