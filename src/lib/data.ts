
import { subDays, format, addDays, addMonths, addYears } from 'date-fns';

export const CSM_TEAMS = [
  { id: "all", name: "All Teams" },
  { id: "Team-Andy", name: "Team-Andy" },
  { id: "Team-Chris", name: "Team-Chris" },
  { id: "Team-Alex", name: "Team-Alex" },
  { id: "Team-Cillin", name: "Team-Cillin" },
];

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
  monthlyNpsScores?: Array<{
    month: string; // Format: 'YYYY-MM'
    score: number;
  }>;
  communicationLog: Communication[];
  trustPilotReview?: {
    date: string | null;
    rating: number | null;
    link: string | null;
  };
  caseStudyInterview?: {
    completed: boolean;
    scheduledDate: string | null;
    notes: string | null;
  };
  referrals?: {
    count: number;
    names: string[];
  };
  csm?: string;
  team?: string;
  callsBooked: number;
  dealsClosed: number;
  mrr: number;
  backendStudents?: number;
  growth?: number;
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

export interface NPSMonthlyTrend {
  month: string;
  score: number;
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
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      rating: 5,
      link: 'https://trustpilot.com/reviews/acmecorp'
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
      notes: 'Great success story about implementation of our services'
    },
    referrals: {
      count: 3,
      names: ['TechStart Inc', 'Global Enterprises', 'MediaGroup Co.']
    },
    csm: 'Sarah Johnson',
    team: 'Team-Andy',
    callsBooked: 12,
    dealsClosed: 3,
    mrr: 1200,
    backendStudents: 10,
    growth: 5
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
    ],
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
      notes: 'Pending interview to discuss challenges and solutions'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Michael Chen',
    team: 'Team-Chris',
    callsBooked: 5,
    dealsClosed: 1,
    mrr: 850,
    backendStudents: 5,
    growth: 3
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
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
      rating: 5,
      link: 'https://trustpilot.com/reviews/globalent'
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
      notes: 'Featured case study on our website'
    },
    referrals: {
      count: 5,
      names: ['Startup Vision', 'TechCorp', 'InnovateX', 'FutureTech', 'DataFlow']
    },
    csm: 'Sarah Johnson',
    team: 'Team-Alex',
    callsBooked: 18,
    dealsClosed: 5,
    mrr: 2400,
    backendStudents: 15,
    growth: 7
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
    ],
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Too early for case study'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Alex Rodriguez',
    team: 'Team-Cillin',
    callsBooked: 2,
    dealsClosed: 0,
    mrr: 500,
    backendStudents: 8,
    growth: 2
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
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
      rating: 2,
      link: 'https://trustpilot.com/reviews/mediagroup'
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Not a candidate for case study'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Emma Watson',
    team: 'Team-Andy',
    callsBooked: 3,
    dealsClosed: 0,
    mrr: 0,
    backendStudents: 12,
    growth: 4
  },
  // Adding more clients
  {
    id: '6',
    name: 'TechCorp',
    logo: 'https://via.placeholder.com/40',
    status: 'active',
    progress: 82,
    endDate: format(addDays(new Date(), 120), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 1800,
      date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 8,
    communicationLog: [
      {
        id: 'c7',
        date: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
        type: 'email',
        subject: 'Feature Request',
        summary: 'Client requested new analytics dashboard features'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
      rating: 4,
      link: 'https://trustpilot.com/reviews/techcorp'
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
      notes: 'Successful implementation case study'
    },
    referrals: {
      count: 2,
      names: ['InnovateX', 'DataSystems']
    },
    csm: 'Michael Chen',
    team: 'Team-Chris',
    callsBooked: 8,
    dealsClosed: 2,
    mrr: 1800,
    backendStudents: 14,
    growth: 6
  },
  {
    id: '7',
    name: 'InnovateX',
    logo: 'https://via.placeholder.com/40',
    status: 'active',
    progress: 65,
    endDate: format(addDays(new Date(), 210), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 1500,
      date: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 9,
    communicationLog: [
      {
        id: 'c8',
        date: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
        type: 'call',
        subject: 'Strategy Call',
        summary: 'Discussed long-term growth strategies'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
      rating: 5,
      link: 'https://trustpilot.com/reviews/innovatex'
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
      notes: 'Planning detailed case study interview'
    },
    referrals: {
      count: 3,
      names: ['TechCorp', 'FutureTech', 'DataFlow']
    },
    csm: 'Alex Rodriguez',
    team: 'Team-Cillin',
    callsBooked: 10,
    dealsClosed: 4,
    mrr: 1500,
    backendStudents: 8,
    growth: 7
  },
  {
    id: '8',
    name: 'DataFlow',
    logo: 'https://via.placeholder.com/40',
    status: 'at-risk',
    progress: 40,
    endDate: format(addDays(new Date(), 45), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 950,
      date: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 6,
    communicationLog: [
      {
        id: 'c9',
        date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
        type: 'meeting',
        subject: 'Service Review',
        summary: 'Client expressed concerns about service delivery'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
      rating: 3,
      link: 'https://trustpilot.com/reviews/dataflow'
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Not suitable for case study currently'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Sarah Johnson',
    team: 'Team-Andy',
    callsBooked: 4,
    dealsClosed: 1,
    mrr: 950,
    backendStudents: 6,
    growth: 2
  },
  {
    id: '9',
    name: 'FutureTech',
    logo: 'https://via.placeholder.com/40',
    status: 'new',
    progress: 20,
    endDate: format(addDays(new Date(), 320), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 600,
      date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: null,
    communicationLog: [
      {
        id: 'c10',
        date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        type: 'call',
        subject: 'Onboarding Progress',
        summary: 'Reviewed initial setup and training plan'
      }
    ],
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Too early for case study'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Michael Chen',
    team: 'Team-Chris',
    callsBooked: 3,
    dealsClosed: 0,
    mrr: 600,
    backendStudents: 4,
    growth: 3
  },
  {
    id: '10',
    name: 'CloudVision Inc',
    logo: 'https://via.placeholder.com/40',
    status: 'churned',
    progress: 25,
    endDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 800,
      date: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
      status: 'failed'
    },
    npsScore: 2,
    communicationLog: [
      {
        id: 'c11',
        date: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
        type: 'email',
        subject: 'Cancellation Notice',
        summary: 'Client sent formal cancellation notice'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
      rating: 2,
      link: 'https://trustpilot.com/reviews/cloudvision'
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Not applicable'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Emma Watson',
    team: 'Team-Andy',
    callsBooked: 1,
    dealsClosed: 0,
    mrr: 0,
    backendStudents: 0,
    growth: 0
  },
  {
    id: '11',
    name: 'Digital Solutions',
    logo: 'https://via.placeholder.com/40',
    status: 'active',
    progress: 75,
    endDate: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 1700,
      date: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 8,
    communicationLog: [
      {
        id: 'c12',
        date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
        type: 'meeting',
        subject: 'Quarterly Review',
        summary: 'Reviewed performance metrics and discussed expansion opportunities'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
      rating: 4,
      link: 'https://trustpilot.com/reviews/digitalsolutions'
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: format(subDays(new Date(), 50), 'yyyy-MM-dd'),
      notes: 'Detailed case study on implementation success'
    },
    referrals: {
      count: 2,
      names: ['TechStart Inc', 'CloudVision Inc']
    },
    csm: 'Alex Rodriguez',
    team: 'Team-Cillin',
    callsBooked: 9,
    dealsClosed: 3,
    mrr: 1700,
    backendStudents: 12,
    growth: 5
  },
  {
    id: '12',
    name: 'GrowthHackers',
    logo: 'https://via.placeholder.com/40',
    status: 'active',
    progress: 88,
    endDate: format(addDays(new Date(), 240), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 2100,
      date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: 10,
    communicationLog: [
      {
        id: 'c13',
        date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        type: 'slack',
        subject: 'Platform Updates',
        summary: 'Informed client about upcoming platform enhancements'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
      rating: 5,
      link: 'https://trustpilot.com/reviews/growthhackers'
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      notes: 'Featured as premium case study'
    },
    referrals: {
      count: 6,
      names: ['Digital Solutions', 'TechCorp', 'DataFlow', 'CloudVision Inc', 'MarketEdge', 'WebSphere']
    },
    csm: 'Sarah Johnson',
    team: 'Team-Andy',
    callsBooked: 16,
    dealsClosed: 7,
    mrr: 2100,
    backendStudents: 18,
    growth: 8
  },
  {
    id: '13',
    name: 'MarketEdge',
    logo: 'https://via.placeholder.com/40',
    status: 'at-risk',
    progress: 52,
    endDate: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 930,
      date: format(subDays(new Date(), 22), 'yyyy-MM-dd'),
      status: 'pending'
    },
    npsScore: 6,
    communicationLog: [
      {
        id: 'c14',
        date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
        type: 'call',
        subject: 'Service Issues',
        summary: 'Client reported ongoing technical issues with platform'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 50), 'yyyy-MM-dd'),
      rating: 4,
      link: 'https://trustpilot.com/reviews/marketedge'
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Waiting for resolution of current issues'
    },
    referrals: {
      count: 1,
      names: ['WebSphere']
    },
    csm: 'Michael Chen',
    team: 'Team-Chris',
    callsBooked: 5,
    dealsClosed: 1,
    mrr: 930,
    backendStudents: 7,
    growth: 3
  },
  {
    id: '14',
    name: 'WebSphere',
    logo: 'https://via.placeholder.com/40',
    status: 'new',
    progress: 30,
    endDate: format(addDays(new Date(), 330), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 750,
      date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      status: 'paid'
    },
    npsScore: null,
    communicationLog: [
      {
        id: 'c15',
        date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        type: 'call',
        subject: 'Implementation Review',
        summary: 'Reviewed implementation progress and addressed questions'
      }
    ],
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Too early for case study'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Alex Rodriguez',
    team: 'Team-Cillin',
    callsBooked: 4,
    dealsClosed: 0,
    mrr: 750,
    backendStudents: 5,
    growth: 2
  },
  {
    id: '15',
    name: 'DataSystems',
    logo: 'https://via.placeholder.com/40',
    status: 'churned',
    progress: 20,
    endDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    lastCommunication: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    lastPayment: {
      amount: 680,
      date: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
      status: 'failed'
    },
    npsScore: 4,
    communicationLog: [
      {
        id: 'c16',
        date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
        type: 'email',
        subject: 'Contract Termination',
        summary: 'Client terminated contract due to budget constraints'
      }
    ],
    trustPilotReview: {
      date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
      rating: 3,
      link: 'https://trustpilot.com/reviews/datasystems'
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      notes: 'Not applicable'
    },
    referrals: {
      count: 0,
      names: []
    },
    csm: 'Emma Watson',
    team: 'Team-Andy',
    callsBooked: 2,
    dealsClosed: 0,
    mrr: 0,
    backendStudents: 0,
    growth: 0
  }
];

MOCK_CLIENTS.forEach(client => {
  if (client.status !== 'new' && client.npsScore !== null) {
    client.monthlyNpsScores = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const monthKey = format(date, 'yyyy-MM');
      
      const baseScore = client.npsScore || 7;
      const randomVariation = Math.floor(Math.random() * 5) - 2;
      const monthlyScore = Math.max(0, Math.min(10, baseScore + randomVariation));
      
      client.monthlyNpsScores.push({
        month: monthKey,
        score: monthlyScore
      });
    }
  }
});

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

export const getNPSMonthlyTrend = (): NPSMonthlyTrend[] => {
  const monthlyScores: { [key: string]: { total: number; count: number } } = {};
  
  MOCK_CLIENTS.forEach(client => {
    if (client.monthlyNpsScores) {
      client.monthlyNpsScores.forEach(monthData => {
        if (!monthlyScores[monthData.month]) {
          monthlyScores[monthData.month] = { total: 0, count: 0 };
        }
        monthlyScores[monthData.month].total += monthData.score;
        monthlyScores[monthData.month].count += 1;
      });
    }
  });
  
  return Object.entries(monthlyScores)
    .map(([month, data]) => ({
      month: format(new Date(`${month}-01`), 'MMM yyyy'),
      score: Math.round((data.total / data.count) * 10) / 10
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
};

export const updateClientNPSScore = (clientId: string, score: number): boolean => {
  const client = MOCK_CLIENTS.find(c => c.id === clientId);
  if (!client) return false;
  
  client.npsScore = score;
  
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  if (!client.monthlyNpsScores) {
    client.monthlyNpsScores = [];
  }
  
  const existingIndex = client.monthlyNpsScores.findIndex(m => m.month === currentMonth);
  
  if (existingIndex >= 0) {
    client.monthlyNpsScores[existingIndex].score = score;
  } else {
    client.monthlyNpsScores.push({
      month: currentMonth,
      score: score
    });
  }
  
  client.monthlyNpsScores.sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });
  
  return true;
};

export const updateClientStatusById = (
  clientId: string,
  updates: {
    trustPilotReview?: {
      date: string | null;
      rating: number | null;
      link: string | null;
    },
    caseStudyInterview?: {
      completed: boolean;
      scheduledDate: string | null;
      notes: string | null;
    }
  }
): boolean => {
  const client = MOCK_CLIENTS.find(c => c.id === clientId);
  if (!client) return false;
  
  if (updates.trustPilotReview) {
    client.trustPilotReview = updates.trustPilotReview;
  }
  
  if (updates.caseStudyInterview) {
    client.caseStudyInterview = updates.caseStudyInterview;
  }
  
  return true;
};

export const getClientMetricsByTeam = (csmName?: string) => {
  const clients = csmName 
    ? MOCK_CLIENTS.filter(client => client.csm === csmName)
    : MOCK_CLIENTS;
  
  return {
    totalCallsBooked: clients.reduce((total, client) => total + client.callsBooked, 0),
    totalDealsClosed: clients.reduce((total, client) => total + client.dealsClosed, 0),
    totalMRR: clients.reduce((total, client) => total + client.mrr, 0)
  };
};

export const getCSMList = () => {
  const csmSet = new Set<string>();
  MOCK_CLIENTS.forEach(client => {
    if (client.csm) {
      csmSet.add(client.csm);
    }
  });
  
  return Array.from(csmSet);
};
