
import { subDays, format, addDays } from 'date-fns';

export interface Client {
  id: string;
  name: string;
  logo?: string;
  status: 'active' | 'at-risk' | 'churned' | 'new';
  progress: number;
  endDate: string;
  lastCommunication: string;
  lastPayment: {
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'failed';
  };
  npsScore: number | null;
  communicationLog: Communication[];
}

export interface Communication {
  id: string;
  date: string;
  type: 'email' | 'call' | 'meeting' | 'slack';
  subject: string;
  summary: string;
}

export interface MetricTrend {
  label: string;
  value: number;
}

export interface ChurnData {
  month: string;
  rate: number;
}

export interface NPSData {
  label: string;
  value: number;
}

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Acme Corp',
    logo: 'https://via.placeholder.com/40',
    status: 'active',
    progress: 78,
    endDate: format(addDays(new Date(), 87), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 1200,
      date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 9,
    communicationLog: [
      {
        id: 'c1',
        date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        type: 'email',
        subject: 'Quarterly Review',
        summary: 'Discussed progress and set goals for next quarter'
      },
      {
        id: 'c2',
        date: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
        type: 'call',
        subject: 'Support Call',
        summary: 'Addressed concerns about feature implementation'
      }
    ]
  },
  {
    id: '2',
    name: 'TechStart Inc',
    logo: 'https://via.placeholder.com/40',
    status: 'at-risk',
    progress: 45,
    endDate: format(addDays(new Date(), 22), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 850,
      date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 5,
    communicationLog: [
      {
        id: 'c3',
        date: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
        type: 'meeting',
        subject: 'Retention Meeting',
        summary: 'Client expressed concerns about ROI'
      }
    ]
  },
  {
    id: '3',
    name: 'Global Enterprises',
    logo: 'https://via.placeholder.com/40',
    status: 'active',
    progress: 92,
    endDate: format(addDays(new Date(), 156), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 2400,
      date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 10,
    communicationLog: [
      {
        id: 'c4',
        date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        type: 'slack',
        subject: 'Quick Update',
        summary: 'Shared new feature release information'
      }
    ]
  },
  {
    id: '4',
    name: 'Startup Vision',
    logo: 'https://via.placeholder.com/40',
    status: 'new',
    progress: 15,
    endDate: format(addDays(new Date(), 345), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 500,
      date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: null,
    communicationLog: [
      {
        id: 'c5',
        date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
        type: 'call',
        subject: 'Onboarding Call',
        summary: 'Initial setup and training session'
      }
    ]
  },
  {
    id: '5',
    name: 'MediaGroup Co.',
    logo: 'https://via.placeholder.com/40',
    status: 'churned',
    progress: 38,
    endDate: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 750,
      date: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
      status: 'failed'
    },
    npsScore: 3,
    communicationLog: [
      {
        id: 'c6',
        date: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
        type: 'email',
        subject: 'Service Cancellation',
        summary: 'Client confirmed their decision to cancel services'
      }
    ]
  }
];

export const MOCK_CHURN_DATA: ChurnData[] = [
  { month: 'Jan', rate: 2.1 },
  { month: 'Feb', rate: 1.8 },
  { month: 'Mar', rate: 2.3 },
  { month: 'Apr', rate: 2.5 },
  { month: 'May', rate: 1.9 },
  { month: 'Jun', rate: 1.7 }
];

export const MOCK_NPS_DATA: NPSData[] = [
  { label: 'Detractors', value: 12 },
  { label: 'Passives', value: 28 },
  { label: 'Promoters', value: 60 }
];

export const getClientById = (id: string): Client | undefined => {
  return MOCK_CLIENTS.find(client => client.id === id);
};

export const getAllClients = (): Client[] => {
  return MOCK_CLIENTS;
};

export const getClientsCountByStatus = () => {
  const counts = {
    active: 0,
    'at-risk': 0,
    churned: 0,
    new: 0
  };
  
  MOCK_CLIENTS.forEach(client => {
    counts[client.status] += 1;
  });
  
  return counts;
};

export const getAverageNPS = (): number => {
  const clientsWithNPS = MOCK_CLIENTS.filter(client => client.npsScore !== null);
  if (clientsWithNPS.length === 0) return 0;
  
  const sum = clientsWithNPS.reduce((total, client) => total + (client.npsScore || 0), 0);
  return Math.round((sum / clientsWithNPS.length) * 10) / 10;
};

export const getChurnData = (): ChurnData[] => {
  return MOCK_CHURN_DATA;
};

export const getNPSData = (): NPSData[] => {
  return MOCK_NPS_DATA;
};
