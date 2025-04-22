
/**
 * API Response Type Definitions
 */

declare namespace API {
  interface Response<T> {
    data: T;
    error: Error | null;
    status: number;
  }
  
  interface Error {
    message: string;
    code?: string;
    details?: unknown;
  }
  
  interface DashboardResponse {
    clients: Client[];
    clientCounts: ClientCounts;
    npsData: NPSData;
    churnData: ChurnData[];
  }
  
  interface Client {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    contractValue: number;
    status: ClientStatus;
    team?: string;
    csm?: string;
    notes?: string;
    progress: number;
    npsScore: number | null;
    callsBooked: number;
    dealsClosed: number;
    mrr: number;
    backendStudents: number;
    growth: number;
  }
  
  type ClientStatus = 'active' | 'at-risk' | 'churned' | 'new' | 'paused' | 'graduated' | 'backend' | 'olympia';
  
  interface ClientCounts {
    active: number;
    'at-risk': number;
    new: number;
    churned: number;
    [key: string]: number;
  }
  
  interface NPSData {
    current: number;
    trend: {
      month: string;
      score: number;
    }[];
  }
  
  interface ChurnData {
    month: string;
    rate: number;
  }
}

export = API;
