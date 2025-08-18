import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { clientService, ClientQuery, ClientMutationData } from '@/services/clientService';
import { Client } from '@/lib/data';

// Unified query keys for cache consistency
export const clientQueryKeys = {
  all: ['clients'] as const,
  lists: () => [...clientQueryKeys.all, 'list'] as const,
  list: (query: ClientQuery) => [...clientQueryKeys.lists(), query] as const,
  details: () => [...clientQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientQueryKeys.details(), id] as const,
  metrics: () => [...clientQueryKeys.all, 'metrics'] as const,
  counts: () => [...clientQueryKeys.all, 'counts'] as const,
};

// Single client hook
export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: clientQueryKeys.detail(id || ''),
    queryFn: () => id ? clientService.getClient(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
}

// Client list hook
export function useClients(query: ClientQuery = {}) {
  return useQuery({
    queryKey: clientQueryKeys.list(query),
    queryFn: () => clientService.getClients(query),
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Client metrics hook
export function useClientMetrics() {
  return useQuery({
    queryKey: clientQueryKeys.metrics(),
    queryFn: () => clientService.getClientMetrics(),
    staleTime: 60000, // 1 minute
    gcTime: 300000,
  });
}

// Client counts hook
export function useClientCounts() {
  return useQuery({
    queryKey: clientQueryKeys.counts(),
    queryFn: () => clientService.getClientCounts(),
    staleTime: 60000,
    gcTime: 300000,
  });
}

// Unified mutation hooks
export function useClientMutations() {
  const queryClient = useQueryClient();

  // Helper to invalidate all client-related queries
  const invalidateAllClientQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
  }, [queryClient]);

  // Optimistic update helper
  const updateClientInCache = useCallback((clientId: string, updates: Partial<Client>) => {
    // Update individual client cache
    queryClient.setQueryData(
      clientQueryKeys.detail(clientId),
      (old: Client | null | undefined) => old ? { ...old, ...updates } : old
    );

    // Update all client lists
    queryClient.setQueriesData(
      { queryKey: clientQueryKeys.lists() },
      (old: Client[] | undefined) => {
        if (!old) return old;
        return old.map(client => 
          client.id === clientId ? { ...client, ...updates } : client
        );
      }
    );
  }, [queryClient]);

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: (data: ClientMutationData) => clientService.createClient(data),
    onSuccess: (newClient) => {
      // Add to cache optimistically
      queryClient.setQueriesData(
        { queryKey: clientQueryKeys.lists() },
        (old: Client[] | undefined) => old ? [newClient, ...old] : [newClient]
      );
      
      // Invalidate metrics and counts
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.counts() });
      
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Failed to create client:', error);
      toast.error('Failed to create client');
      invalidateAllClientQueries();
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ClientMutationData }) =>
      clientService.updateClient(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clientQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousClient = queryClient.getQueryData(clientQueryKeys.detail(id));
      
      // Optimistically update
      updateClientInCache(id, updates);
      
      return { previousClient, id };
    },
    onSuccess: (updatedClient) => {
      // Ensure cache is up to date with server response
      queryClient.setQueryData(clientQueryKeys.detail(updatedClient.id), updatedClient);
      
      // Update in lists
      queryClient.setQueriesData(
        { queryKey: clientQueryKeys.lists() },
        (old: Client[] | undefined) => {
          if (!old) return old;
          return old.map(client => 
            client.id === updatedClient.id ? updatedClient : client
          );
        }
      );
      
      // Invalidate metrics and counts if status or MRR changed
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.counts() });
      
      toast.success('Client updated successfully');
    },
    onError: (error, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousClient) {
        queryClient.setQueryData(clientQueryKeys.detail(id), context.previousClient);
      }
      
      console.error('Failed to update client:', error);
      toast.error('Failed to update client');
      invalidateAllClientQueries();
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clientQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousClient = queryClient.getQueryData(clientQueryKeys.detail(id));
      
      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: clientQueryKeys.detail(id) });
      queryClient.setQueriesData(
        { queryKey: clientQueryKeys.lists() },
        (old: Client[] | undefined) => old ? old.filter(client => client.id !== id) : old
      );
      
      return { previousClient, id };
    },
    onSuccess: () => {
      // Invalidate metrics and counts
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.counts() });
      
      toast.success('Client deleted successfully');
    },
    onError: (error, id, context) => {
      // Rollback optimistic update
      if (context?.previousClient) {
        queryClient.setQueryData(clientQueryKeys.detail(id), context.previousClient);
      }
      
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client');
      invalidateAllClientQueries();
    },
  });

  return {
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
    invalidateAllClientQueries,
  };
}

// Convenience hook for dashboard data
export function useDashboardClientData(teamFilter?: string) {
  const clientsQuery = useClients({ teamFilter });
  const metricsQuery = useClientMetrics();
  const countsQuery = useClientCounts();

  return {
    clients: clientsQuery.data || [],
    metrics: metricsQuery.data,
    counts: countsQuery.data,
    isLoading: clientsQuery.isLoading || metricsQuery.isLoading || countsQuery.isLoading,
    error: clientsQuery.error || metricsQuery.error || countsQuery.error,
    refetch: () => {
      clientsQuery.refetch();
      metricsQuery.refetch();
      countsQuery.refetch();
    },
  };
}