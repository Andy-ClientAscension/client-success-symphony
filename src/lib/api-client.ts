
import { toast } from "@/hooks/use-toast";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";
import type API from "@/types/api";
import { errorService } from "@/utils/errorService";

interface FetcherOptions {
  retries?: number;
  retryDelay?: number;
  silentErrors?: boolean;
}

/**
 * Generic fetcher function with error handling and retries
 */
export async function fetcher<T>(
  key: string,
  fn: () => Promise<T>,
  options: FetcherOptions = {}
): Promise<T> {
  const { retries = 3, retryDelay = 1000, silentErrors = false } = options;
  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (process.env.NODE_ENV === "development") {
        console.error(`API request "${key}" failed (attempt ${i + 1}/${retries}):`, error);
      }
      
      // Use errorService to detect error types
      const errorType = errorService.detectErrorType(error);
      
      // Skip retries for certain error types
      if (errorType === 'cors' || errorType === 'auth') {
        if (process.env.NODE_ENV === "development") {
          console.warn(`${errorType} error detected - skipping additional retries`);
        }
        break;
      }
      
      // Skip retries for Sentry configuration errors
      if (typeof error === 'string' && errorService.isPlaceholderDSN(error)) {
        if (process.env.NODE_ENV === "development") {
          console.warn('Error tracking is misconfigured with a placeholder DSN. This is expected in development.');
        }
        break;
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }

  // Use our error service to handle the error properly
  const errorMessage = errorService.handleNetworkError(lastError, { 
    shouldNotify: !silentErrors,
    context: { key }
  });
  
  throw lastError;
}

/**
 * Type-safe API client with default error handling
 */
export const apiClient = {
  async getDashboardData(): Promise<API.DashboardResponse> {
    return fetcher("dashboard", async () => {
      const clients = await getAllClients();
      const clientCounts = await getClientsCountByStatus();
      const npsAvg = await getAverageNPS();
      const churnData = await getChurnData();

      // Map data to match the expected API response format
      const npsData: API.NPSData = {
        current: typeof npsAvg === 'object' ? npsAvg.current : npsAvg,
        trend: [
          { month: 'Jan', score: 7.5 },
          { month: 'Feb', score: 7.8 },
          { month: 'Mar', score: 8.1 },
          { month: 'Apr', score: 8.3 },
          { month: 'May', score: 8.0 },
          { month: 'Jun', score: 8.4 }
        ]
      };

      // To ensure type safety, we need to explicitly map the data from our source to our API types
      const apiClients: API.Client[] = clients.map(client => ({
        id: client.id,
        name: client.name,
        startDate: client.startDate,
        endDate: client.endDate,
        contractValue: client.contractValue,
        status: client.status as API.ClientStatus,
        team: client.team,
        csm: client.csm,
        notes: client.notes,
        progress: client.progress,
        npsScore: client.npsScore,
        callsBooked: client.callsBooked,
        dealsClosed: client.dealsClosed,
        mrr: client.mrr,
        backendStudents: client.backendStudents,
        growth: client.growth
      }));

      return {
        clients: apiClients,
        clientCounts,
        npsData,
        churnData
      };
    });
  }
};
