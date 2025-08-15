import { useDashboardData } from './useDashboardData';
import { Client } from '@/lib/data';

interface ClientDataHook {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClientData(): ClientDataHook {
  // Use the unified dashboard data source to ensure consistency
  const { allClients, isLoading, error, refreshData } = useDashboardData({ enableAutoSync: false });
  
  return {
    clients: allClients || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: refreshData
  };
}