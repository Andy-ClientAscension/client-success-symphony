
import { format, addDays, subDays } from "date-fns";

export interface Client {
  id: string;
  name: string;
  status: "new" | "active" | "backend" | "olympia" | "at-risk" | "churned";
  team?: string;
  csm?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  notes?: string;
  progress?: number;
  npsScore?: number | null;
  callsBooked?: number;
  dealsClosed?: number;
  mrr?: number;
  lastCommunication?: string;
  backendStudents?: number;
  growth?: number;
  logo?: string;
  lastPayment?: {
    amount: number;
    date: string;
  };
  trustPilotReview?: {
    date: string | null;
    rating: number | null;
    link: string | null;
    notes?: string;
  };
  caseStudyInterview?: {
    completed: boolean;
    scheduledDate: string | null;
    conducted: boolean;
    notes: string;
  };
  referrals?: {
    count: number;
    names: string[];
  };
  communicationLog?: Communication[];
}

export interface Communication {
  id: string;
  type: "email" | "call" | "meeting" | "note";
  date: string;
  subject: string;
  content: string;
  sentBy: string;
}

export interface NPSData {
  score: number;
  date: string;
  clientId: string;
  feedback?: string;
}

export interface NPSMonthlyTrend {
  month: string;
  score: number;
  count: number;
}

export interface ChurnDataPoint {
  month: string;
  rate: number;
}

export const CSM_TEAMS = [
  { id: "all", name: "All Teams" },
  { id: "Team-Andy", name: "Team Andy" },
  { id: "Team-Chris", name: "Team Chris" },
  { id: "Team-Alex", name: "Team Alex" },
  { id: "Team-Cillin", name: "Team Cillin" },
];

const BASE_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Acme Corporation",
    status: "active",
    team: "enterprise",
    csm: "John Smith",
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    contractValue: 50000,
    notes: "Key enterprise client with multiple product lines",
    progress: 85,
    npsScore: 9,
    callsBooked: 8,
    dealsClosed: 3,
    mrr: 4500,
    backendStudents: 12,
    growth: 15,
    lastCommunication: "2023-11-15",
    lastPayment: {
      amount: 4500,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-10-15",
      rating: 5,
      link: "https://trustpilot.com/reviews/acme123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-20",
      conducted: true,
      notes: "Great success story with 45% efficiency improvement"
    },
    referrals: {
      count: 3,
      names: ["Stark Industries", "Wayne Enterprises", "Oscorp"]
    },
    communicationLog: [
      {
        id: "c1-1",
        type: "meeting",
        date: "2023-11-15",
        subject: "Quarterly Review",
        content: "Discussed expansion to new markets",
        sentBy: "John Smith"
      },
      {
        id: "c1-2",
        type: "email",
        date: "2023-11-10",
        subject: "Feature Request",
        content: "Client requested improved reporting",
        sentBy: "Support Team"
      }
    ]
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
    notes: "Renewal discussions needed, showing signs of churn",
    progress: 45,
    npsScore: 6,
    callsBooked: 4,
    dealsClosed: 1,
    mrr: 2200,
    backendStudents: 7,
    growth: 2,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 2200,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-08-22",
      rating: 3,
      link: "https://trustpilot.com/reviews/globex789"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: "2023-11-25",
      conducted: false,
      notes: "Need to focus on their success with our product"
    },
    referrals: {
      count: 0,
      names: []
    },
    communicationLog: [
      {
        id: "c2-1",
        type: "call",
        date: "2023-11-05",
        subject: "Renewal Discussion",
        content: "Client expressed budget concerns",
        sentBy: "Jane Doe"
      }
    ]
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
    notes: "New client, needs onboarding assistance",
    progress: 25,
    npsScore: null,
    callsBooked: 3,
    dealsClosed: 1,
    mrr: 1800,
    backendStudents: 3,
    growth: 0,
    lastCommunication: "2023-11-10",
    lastPayment: {
      amount: 1800,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Too early for case study"
    },
    communicationLog: [
      {
        id: "c3-1",
        type: "meeting",
        date: "2023-11-10",
        subject: "Onboarding Session",
        content: "Walked through platform capabilities",
        sentBy: "David Johnson"
      }
    ]
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
    notes: "Expansion opportunity in Q4",
    progress: 92,
    npsScore: 10,
    callsBooked: 12,
    dealsClosed: 5,
    mrr: 6800,
    backendStudents: 18,
    growth: 22,
    lastCommunication: "2023-11-12",
    lastPayment: {
      amount: 6800,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-10-05",
      rating: 5,
      link: "https://trustpilot.com/reviews/massivedynamic456"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-15",
      conducted: true,
      notes: "Excellent testimonial for marketing"
    },
    referrals: {
      count: 2,
      names: ["Hooli", "Pied Piper"]
    },
    communicationLog: [
      {
        id: "c4-1",
        type: "email",
        date: "2023-11-12",
        subject: "Expansion Proposal",
        content: "Sent pricing for enterprise tier upgrade",
        sentBy: "Sarah Williams"
      }
    ]
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
    notes: "Churned due to budget constraints",
    progress: 0,
    npsScore: 4,
    callsBooked: 2,
    dealsClosed: 0,
    mrr: 0,
    backendStudents: 0,
    growth: -100,
    lastCommunication: "2023-07-25",
    lastPayment: {
      amount: 2800,
      date: "2023-07-01"
    },
    trustPilotReview: {
      date: "2023-06-12",
      rating: 3,
      link: "https://trustpilot.com/reviews/stark321"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Not a candidate due to churn"
    },
    communicationLog: [
      {
        id: "c5-1",
        type: "call",
        date: "2023-07-25",
        subject: "Exit Interview",
        content: "Discussed reasons for cancellation",
        sentBy: "Michael Brown"
      }
    ]
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
    notes: "Strategic partner with multiple departments using our platform",
    progress: 75,
    npsScore: 8,
    callsBooked: 6,
    dealsClosed: 4,
    mrr: 5000,
    backendStudents: 10,
    growth: 10,
    lastCommunication: "2023-11-10",
    lastPayment: {
      amount: 5000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-09-10",
      rating: 4,
      link: "https://trustpilot.com/reviews/wayne123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-08-15",
      conducted: true,
      notes: "Excellent case study with 50% increase in sales"
    },
    referrals: {
      count: 1,
      names: ["Globex Industries"]
    },
    communicationLog: [
      {
        id: "c6-1",
        type: "meeting",
        date: "2023-11-10",
        subject: "Product Launch",
        content: "Discussed new product features",
        sentBy: "John Smith"
      }
    ]
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
    notes: "Usage declining in last quarter, needs intervention",
    progress: 50,
    npsScore: 7,
    callsBooked: 4,
    dealsClosed: 2,
    mrr: 4000,
    backendStudents: 8,
    growth: 5,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 4000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-07-10",
      rating: 3,
      link: "https://trustpilot.com/reviews/umbrella789"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: "2023-10-15",
      conducted: false,
      notes: "Need to improve customer service"
    },
    referrals: {
      count: 0,
      names: []
    },
    communicationLog: [
      {
        id: "c7-1",
        type: "email",
        date: "2023-11-05",
        subject: "Renewal Reminder",
        content: "Sent reminder for renewal",
        sentBy: "Support Team"
      }
    ]
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
    notes: "Recently migrated from competitor, needs extra support",
    progress: 30,
    npsScore: null,
    callsBooked: 2,
    dealsClosed: 1,
    mrr: 2000,
    backendStudents: 5,
    growth: 0,
    lastCommunication: "2023-11-01",
    lastPayment: {
      amount: 2000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Too early for case study"
    },
    communicationLog: [
      {
        id: "c8-1",
        type: "meeting",
        date: "2023-11-01",
        subject: "Onboarding Session",
        content: "Walked through platform capabilities",
        sentBy: "Jane Doe"
      }
    ]
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
    notes: "Growing startup with expansion potential",
    progress: 60,
    npsScore: 7,
    callsBooked: 5,
    dealsClosed: 3,
    mrr: 1500,
    backendStudents: 4,
    growth: 3,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 1500,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-08-10",
      rating: 4,
      link: "https://trustpilot.com/reviews/soylent123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-07-15",
      conducted: true,
      notes: "Excellent case study with 40% increase in sales"
    },
    referrals: {
      count: 2,
      names: ["Massive Dynamic", "Wayne Enterprises"]
    },
    communicationLog: [
      {
        id: "c9-1",
        type: "email",
        date: "2023-11-05",
        subject: "Product Launch",
        content: "Discussed new product features",
        sentBy: "David Johnson"
      }
    ]
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
    notes: "Churned due to acquisition by competitor",
    progress: 0,
    npsScore: 3,
    callsBooked: 1,
    dealsClosed: 0,
    mrr: 0,
    backendStudents: 0,
    growth: -100,
    lastCommunication: "2023-07-25",
    lastPayment: {
      amount: 1100,
      date: "2023-07-01"
    },
    trustPilotReview: {
      date: "2023-06-12",
      rating: 2,
      link: "https://trustpilot.com/reviews/oscorp321"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Not a candidate due to churn"
    },
    communicationLog: [
      {
        id: "c10-1",
        type: "call",
        date: "2023-07-25",
        subject: "Exit Interview",
        content: "Discussed reasons for cancellation",
        sentBy: "Michael Brown"
      }
    ]
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
    notes: "Key account with multiple product integrations",
    progress: 95,
    npsScore: 9,
    callsBooked: 10,
    dealsClosed: 6,
    mrr: 7000,
    backendStudents: 15,
    growth: 15,
    lastCommunication: "2023-11-15",
    lastPayment: {
      amount: 7000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-10-15",
      rating: 5,
      link: "https://trustpilot.com/reviews/hooli123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-20",
      conducted: true,
      notes: "Great success story with 45% efficiency improvement"
    },
    referrals: {
      count: 3,
      names: ["Acme Corporation", "Globex Industries", "Initech Software"]
    },
    communicationLog: [
      {
        id: "c11-1",
        type: "meeting",
        date: "2023-11-15",
        subject: "Quarterly Review",
        content: "Discussed expansion to new markets",
        sentBy: "John Smith"
      },
      {
        id: "c11-2",
        type: "email",
        date: "2023-11-10",
        subject: "Feature Request",
        content: "Client requested improved reporting",
        sentBy: "Support Team"
      }
    ]
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
    notes: "Innovative startup with rapid growth potential",
    progress: 40,
    npsScore: null,
    callsBooked: 3,
    dealsClosed: 1,
    mrr: 1000,
    backendStudents: 3,
    growth: 0,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 1000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Too early for case study"
    },
    communicationLog: [
      {
        id: "c12-1",
        type: "meeting",
        date: "2023-11-05",
        subject: "Onboarding Session",
        content: "Walked through platform capabilities",
        sentBy: "Sarah Williams"
      }
    ]
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
    notes: "Struggling with adoption, needs training",
    progress: 35,
    npsScore: 6,
    callsBooked: 3,
    dealsClosed: 1,
    mrr: 2000,
    backendStudents: 4,
    growth: 2,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 2000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-08-10",
      rating: 3,
      link: "https://trustpilot.com/reviews/dunder123"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: "2023-10-15",
      conducted: false,
      notes: "Need to improve customer service"
    },
    communicationLog: [
      {
        id: "c13-1",
        type: "email",
        date: "2023-11-05",
        subject: "Renewal Reminder",
        content: "Sent reminder for renewal",
        sentBy: "Support Team"
      }
    ]
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
    notes: "Expanding to new locations, opportunity for upsell",
    progress: 70,
    npsScore: 8,
    callsBooked: 6,
    dealsClosed: 4,
    mrr: 3000,
    backendStudents: 6,
    growth: 4,
    lastCommunication: "2023-11-10",
    lastPayment: {
      amount: 3000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-09-10",
      rating: 4,
      link: "https://trustpilot.com/reviews/lospollos123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-08-15",
      conducted: true,
      notes: "Excellent case study with 50% increase in sales"
    },
    referrals: {
      count: 1,
      names: ["Globex Industries"]
    },
    communicationLog: [
      {
        id: "c14-1",
        type: "meeting",
        date: "2023-11-10",
        subject: "Product Launch",
        content: "Discussed new product features",
        sentBy: "David Johnson"
      }
    ]
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
    notes: "Churned due to internal restructuring",
    progress: 0,
    npsScore: 3,
    callsBooked: 1,
    dealsClosed: 0,
    mrr: 0,
    backendStudents: 0,
    growth: -100,
    lastCommunication: "2023-07-25",
    lastPayment: {
      amount: 3500,
      date: "2023-07-01"
    },
    trustPilotReview: {
      date: "2023-06-12",
      rating: 2,
      link: "https://trustpilot.com/reviews/gekko123"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Not a candidate due to churn"
    },
    communicationLog: [
      {
        id: "c15-1",
        type: "call",
        date: "2023-07-25",
        subject: "Exit Interview",
        content: "Discussed reasons for cancellation",
        sentBy: "Michael Brown"
      }
    ]
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
    notes: "Large enterprise client with complex needs",
    progress: 80,
    npsScore: 9,
    callsBooked: 8,
    dealsClosed: 3,
    mrr: 4500,
    backendStudents: 12,
    growth: 15,
    lastCommunication: "2023-11-15",
    lastPayment: {
      amount: 4500,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-10-15",
      rating: 5,
      link: "https://trustpilot.com/reviews/enterprisesolutions123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-20",
      conducted: true,
      notes: "Great success story with 45% efficiency improvement"
    },
    referrals: {
      count: 3,
      names: ["Acme Corporation", "Globex Industries", "Initech Software"]
    },
    communicationLog: [
      {
        id: "c16-1",
        type: "meeting",
        date: "2023-11-15",
        subject: "Quarterly Review",
        content: "Discussed expansion to new markets",
        sentBy: "John Smith"
      },
      {
        id: "c16-2",
        type: "email",
        date: "2023-11-10",
        subject: "Feature Request",
        content: "Client requested improved reporting",
        sentBy: "Support Team"
      }
    ]
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
    notes: "New client transitioning from competitor",
    progress: 20,
    npsScore: null,
    callsBooked: 2,
    dealsClosed: 1,
    mrr: 1000,
    backendStudents: 3,
    growth: 0,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 1000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Too early for case study"
    },
    communicationLog: [
      {
        id: "c17-1",
        type: "meeting",
        date: "2023-11-05",
        subject: "Onboarding Session",
        content: "Walked through platform capabilities",
        sentBy: "Sarah Lee"
      }
    ]
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
    notes: "Healthcare industry, requires HIPAA compliance",
    progress: 70,
    npsScore: 8,
    callsBooked: 6,
    dealsClosed: 4,
    mrr: 2000,
    backendStudents: 4,
    growth: 2,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 2000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-08-10",
      rating: 4,
      link: "https://trustpilot.com/reviews/healthcare123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-15",
      conducted: true,
      notes: "Excellent case study with 50% increase in sales"
    },
    referrals: {
      count: 1,
      names: ["Globex Industries"]
    },
    communicationLog: [
      {
        id: "c18-1",
        type: "meeting",
        date: "2023-11-05",
        subject: "Product Launch",
        content: "Discussed new product features",
        sentBy: "James Thompson"
      }
    ]
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
    notes: "Experiencing budget constraints, needs attention",
    progress: 40,
    npsScore: 6,
    callsBooked: 3,
    dealsClosed: 1,
    mrr: 1000,
    backendStudents: 4,
    growth: 2,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 1000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-08-10",
      rating: 3,
      link: "https://trustpilot.com/reviews/urban123"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: "2023-10-15",
      conducted: false,
      notes: "Need to improve customer service"
    },
    communicationLog: [
      {
        id: "c19-1",
        type: "email",
        date: "2023-11-05",
        subject: "Renewal Reminder",
        content: "Sent reminder for renewal",
        sentBy: "Support Team"
      }
    ]
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
    notes: "International shipping company with good growth potential",
    progress: 85,
    npsScore: 9,
    callsBooked: 8,
    dealsClosed: 3,
    mrr: 3000,
    backendStudents: 12,
    growth: 15,
    lastCommunication: "2023-11-15",
    lastPayment: {
      amount: 3000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-10-15",
      rating: 5,
      link: "https://trustpilot.com/reviews/globallogistics123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-20",
      conducted: true,
      notes: "Great success story with 45% efficiency improvement"
    },
    referrals: {
      count: 3,
      names: ["Acme Corporation", "Globex Industries", "Initech Software"]
    },
    communicationLog: [
      {
        id: "c20-1",
        type: "meeting",
        date: "2023-11-15",
        subject: "Quarterly Review",
        content: "Discussed expansion to new markets",
        sentBy: "John Smith"
      },
      {
        id: "c20-2",
        type: "email",
        date: "2023-11-10",
        subject: "Feature Request",
        content: "Client requested improved reporting",
        sentBy: "Support Team"
      }
    ]
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
    notes: "Educational technology company, needs implementation support",
    progress: 50,
    npsScore: null,
    callsBooked: 3,
    dealsClosed: 1,
    mrr: 1000,
    backendStudents: 3,
    growth: 0,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 1000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Too early for case study"
    },
    communicationLog: [
      {
        id: "c21-1",
        type: "meeting",
        date: "2023-11-05",
        subject: "Onboarding Session",
        content: "Walked through platform capabilities",
        sentBy: "Laura Garcia"
      }
    ]
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
    notes: "Financial services client with regulatory requirements",
    progress: 60,
    npsScore: 8,
    callsBooked: 6,
    dealsClosed: 4,
    mrr: 2000,
    backendStudents: 4,
    growth: 2,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 2000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-08-10",
      rating: 4,
      link: "https://trustpilot.com/reviews/apex123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-15",
      conducted: true,
      notes: "Excellent case study with 50% increase in sales"
    },
    referrals: {
      count: 1,
      names: ["Globex Industries"]
    },
    communicationLog: [
      {
        id: "c22-1",
        type: "meeting",
        date: "2023-11-05",
        subject: "Product Launch",
        content: "Discussed new product features",
        sentBy: "Daniel Parker"
      }
    ]
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
    notes: "Experiencing integration issues, needs technical support",
    progress: 50,
    npsScore: 6,
    callsBooked: 3,
    dealsClosed: 1,
    mrr: 1000,
    backendStudents: 4,
    growth: 2,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 1000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-08-10",
      rating: 3,
      link: "https://trustpilot.com/reviews/pacific123"
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: "2023-10-15",
      conducted: false,
      notes: "Need to improve customer service"
    },
    communicationLog: [
      {
        id: "c23-1",
        type: "email",
        date: "2023-11-05",
        subject: "Renewal Reminder",
        content: "Sent reminder for renewal",
        sentBy: "Support Team"
      }
    ]
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
    notes: "Long-term contract with innovative technology company",
    progress: 90,
    npsScore: 10,
    callsBooked: 10,
    dealsClosed: 6,
    mrr: 5000,
    backendStudents: 15,
    growth: 15,
    lastCommunication: "2023-11-15",
    lastPayment: {
      amount: 5000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: "2023-10-15",
      rating: 5,
      link: "https://trustpilot.com/reviews/quantum123"
    },
    caseStudyInterview: {
      completed: true,
      scheduledDate: "2023-09-20",
      conducted: true,
      notes: "Great success story with 45% efficiency improvement"
    },
    referrals: {
      count: 3,
      names: ["Acme Corporation", "Globex Industries", "Initech Software"]
    },
    communicationLog: [
      {
        id: "c24-1",
        type: "meeting",
        date: "2023-11-15",
        subject: "Quarterly Review",
        content: "Discussed expansion to new markets",
        sentBy: "John Smith"
      },
      {
        id: "c24-2",
        type: "email",
        date: "2023-11-10",
        subject: "Feature Request",
        content: "Client requested improved reporting",
        sentBy: "Support Team"
      }
    ]
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
    notes: "Green energy startup with ambitious growth plans",
    progress: 30,
    npsScore: null,
    callsBooked: 2,
    dealsClosed: 1,
    mrr: 1000,
    backendStudents: 3,
    growth: 0,
    lastCommunication: "2023-11-05",
    lastPayment: {
      amount: 1000,
      date: "2023-11-01"
    },
    trustPilotReview: {
      date: null,
      rating: null,
      link: null
    },
    caseStudyInterview: {
      completed: false,
      scheduledDate: null,
      conducted: false,
      notes: "Too early for case study"
    },
    communicationLog: [
      {
        id: "c25-1",
        type: "meeting",
        date: "2023-11-05",
        subject: "Onboarding Session",
        content: "Walked through platform capabilities",
        sentBy: "Sophia Martinez"
      }
    ]
  }
];

function generateMockClients(startId: number, count: number): Client[] {
  const statuses: ("new" | "active" | "at-risk" | "churned")[] = ["new", "active", "at-risk", "churned"];
  const teams = ["Team-Andy", "Team-Chris", "Team-Alex", "Team-Cillin"];
  const csms = ["Andy", "Chris", "Alex", "Cillin"];
  const companyPrefixes = ["Global", "Advanced", "Prime", "Modern", "Elite", "Tech", "Digital", "Smart", "Innovative", "Next", "Future", "Strategic", "Synergy", "Dynamic", "Creative"];
  const companySuffixes = ["Solutions", "Systems", "Technologies", "Enterprises", "Group", "Consulting", "Partners", "Labs", "Industries", "Networks", "Services", "Innovations", "Applications", "Dynamics", "Ventures"];
  
  const mockClients: Client[] = [];
  
  for (let i = 0; i < count; i++) {
    const idNum = startId + i;
    const statusIndex = Math.floor(Math.random() * statuses.length);
    const teamIndex = Math.floor(Math.random() * teams.length);
    
    const today = new Date();
    const startDate = subDays(today, Math.floor(Math.random() * 500) + 30);
    const endDate = addDays(startDate, Math.floor(Math.random() * 365) + 180);
    
    const prefixIndex = Math.floor(Math.random() * companyPrefixes.length);
    const suffixIndex = Math.floor(Math.random() * companySuffixes.length);
    const companyName = `${companyPrefixes[prefixIndex]} ${companySuffixes[suffixIndex]}`;
    
    const progress = statuses[statusIndex] === "churned" ? 0 : Math.floor(Math.random() * 101);
    const npsScore = Math.random() > 0.2 ? Math.floor(Math.random() * 11) : null;
    const callsBooked = Math.floor(Math.random() * 15);
    const dealsClosed = Math.floor(Math.random() * (callsBooked + 1));
    const mrr = Math.floor(Math.random() * 10000) + 500;
    const contractValue = mrr * (Math.floor(Math.random() * 24) + 6);
    
    mockClients.push({
      id: String(idNum),
      name: companyName,
      status: statuses[statusIndex],
      team: teams[teamIndex],
      csm: csms[teamIndex],
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      contractValue,
      notes: `Auto-generated client #${idNum} for testing pagination`,
      progress,
      npsScore,
      callsBooked,
      dealsClosed,
      mrr,
      backendStudents: Math.floor(Math.random() * 20) + 1,
      growth: Math.floor(Math.random() * 30) - 5,
      lastCommunication: format(subDays(today, Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
      lastPayment: {
        amount: mrr,
        date: format(subDays(today, Math.floor(Math.random() * 30)), 'yyyy-MM-dd')
      },
      trustPilotReview: Math.random() > 0.4 ? {
        date: format(subDays(today, Math.floor(Math.random() * 90)), 'yyyy-MM-dd'),
        rating: Math.floor(Math.random() * 5) + 1,
        link: `https://trustpilot.com/reviews/mockid${idNum}`
      } : {
        date: null,
        rating: null,
        link: null
      },
      caseStudyInterview: {
        completed: Math.random() > 0.7,
        scheduledDate: Math.random() > 0.5 ? format(addDays(today, Math.floor(Math.random() * 30)), 'yyyy-MM-dd') : null,
        conducted: Math.random() > 0.8,
        notes: "Auto-generated case study notes"
      },
      communicationLog: [
        {
          id: `c${idNum}-1`,
          type: "email",
          date: format(subDays(today, Math.floor(Math.random() * 14) + 1), 'yyyy-MM-dd'),
          subject: "Follow-up",
          content: "Routine check-in with client",
          sentBy: csms[teamIndex]
        }
      ]
    });
  }
  
  return mockClients;
}

const ADDITIONAL_CLIENTS = generateMockClients(26, 150);

export const CLIENTS: Client[] = [...BASE_CLIENTS, ...ADDITIONAL_CLIENTS];

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

export function getClientMetricsByTeam(teamFilter?: string) {
  // Base metrics
  const baseMetrics = {
    enterprise: {
      revenue: 325000,
      clients: 5,
      churnRate: 0.05,
    },
    "mid-market": {
      revenue: 123500,
      clients: 4,
      churnRate: 0.08,
    },
    smb: {
      revenue: 63700,
      clients: 6,
      churnRate: 0.12,
    }
  };
  
  // Add additional metrics needed by components
  const metrics = {
    ...baseMetrics,
    totalMRR: 38000,
    totalCallsBooked: 85,
    totalDealsClosed: 28
  };
  
  if (teamFilter && teamFilter !== 'all' && metrics[teamFilter as keyof typeof baseMetrics]) {
    return {
      [teamFilter]: metrics[teamFilter as keyof typeof baseMetrics],
      totalMRR: metrics.totalMRR,
      totalCallsBooked: metrics.totalCallsBooked,
      totalDealsClosed: metrics.totalDealsClosed
    };
  }
  
  return metrics;
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

export function getAllClients(): Client[] {
  return CLIENTS;
}

export function getChurnData(): ChurnDataPoint[] {
  return [
    { month: "Jan", rate: 2.1 },
    { month: "Feb", rate: 2.3 },
    { month: "Mar", rate: 2.0 },
    { month: "Apr", rate: 2.2 },
    { month: "May", rate: 1.8 },
    { month: "Jun", rate: 1.6 },
    { month: "Jul", rate: 1.9 },
    { month: "Aug", rate: 2.4 },
    { month: "Sep", rate: 2.8 },
    { month: "Oct", rate: 2.5 },
    { month: "Nov", rate: 2.2 },
    { month: "Dec", rate: 2.0 }
  ];
}

export function getNPSMonthlyTrend(): NPSMonthlyTrend[] {
  return [
    { month: "Jan", score: 42, count: 18 },
    { month: "Feb", score: 40, count: 22 },
    { month: "Mar", score: 38, count: 15 },
    { month: "Apr", score: 39, count: 20 },
    { month: "May", score: 41, count: 25 },
    { month: "Jun", score: 44, count: 30 },
    { month: "Jul", score: 45, count: 28 },
    { month: "Aug", score: 47, count: 32 },
    { month: "Sep", score: 42, count: 27 },
    { month: "Oct", score: 40, count: 22 },
    { month: "Nov", score: 43, count: 24 },
    { month: "Dec", score: 45, count: 29 }
  ];
}

export function getCSMList(): string[] {
  const csmSet = new Set<string>();
  
  CLIENTS.forEach(client => {
    if (client.csm) {
      csmSet.add(client.csm);
    }
  });
  
  return Array.from(csmSet);
}

export function updateClientNPSScore(clientId: string, score: number): boolean {
  const clientIndex = CLIENTS.findIndex(c => c.id === clientId);
  if (clientIndex !== -1) {
    CLIENTS[clientIndex].npsScore = score;
    return true;
  }
  return false;
}

export function updateClientStatusById(clientId: string, updates: Partial<Client>): boolean {
  const clientIndex = CLIENTS.findIndex(c => c.id === clientId);
  if (clientIndex !== -1) {
    CLIENTS[clientIndex] = { ...CLIENTS[clientIndex], ...updates };
    return true;
  }
  return false;
}

export const MOCK_CLIENTS = CLIENTS;
