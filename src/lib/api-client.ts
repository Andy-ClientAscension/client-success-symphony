
import { toast } from "@/components/ui/use-toast";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";
import type API from "@/types/api";

interface FetcherOptions {
  retries?: number;
  retryDelay?: number;
}

/**
 * Generic fetcher function with error handling and retries
 */
export async function fetcher<T>(
  key: string,
  fn: () => Promise<T>,
  options: FetcherOptions = {}
): Promise<T> {
  const { retries = 3, retryDelay = 1000 } = options;
  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }

  // If all retries failed, show error toast and throw
  toast({
    title: "Error",
    description: lastError?.message || "Failed to fetch data",
    variant: "destructive",
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

      return {
        clients,
        clientCounts,
        npsData,
        churnData
      };
    });
  }
};
