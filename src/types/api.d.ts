
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
    progress?: number; // Changed from required to optional to match data.ts
    npsScore?: number | null; // Changed from required to optional to match data.ts
    callsBooked?: number; // Changed from required to optional to match data.ts
    dealsClosed?: number; // Changed from required to optional to match data.ts
    mrr?: number; // Changed from required to optional to match data.ts
    backendStudents?: number;
    growth?: number;
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
