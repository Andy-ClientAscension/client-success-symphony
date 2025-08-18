import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { clientQueryKeys } from './useUnifiedClientData';
import { validateClient } from '@/utils/clientValidation';
import { Client } from '@/lib/data';

export function useSupabaseRealtime() {
  const queryClient = useQueryClient();

  const handleClientInsert = useCallback((payload: any) => {
    const newClient = validateClient(payload.new);
    if (!newClient) return;

    // Add to all client lists
    queryClient.setQueriesData(
      { queryKey: clientQueryKeys.lists() },
      (old: Client[] | undefined) => old ? [newClient, ...old] : [newClient]
    );

    // Invalidate metrics and counts
    queryClient.invalidateQueries({ queryKey: clientQueryKeys.metrics() });
    queryClient.invalidateQueries({ queryKey: clientQueryKeys.counts() });
  }, [queryClient]);

  const handleClientUpdate = useCallback((payload: any) => {
    const updatedClient = validateClient(payload.new);
    if (!updatedClient) return;

    // Update individual client cache
    queryClient.setQueryData(
      clientQueryKeys.detail(updatedClient.id),
      updatedClient
    );

    // Update in all lists
    queryClient.setQueriesData(
      { queryKey: clientQueryKeys.lists() },
      (old: Client[] | undefined) => {
        if (!old) return old;
        return old.map(client => 
          client.id === updatedClient.id ? updatedClient : client
        );
      }
    );

    // Invalidate metrics and counts if relevant fields changed
    const oldClient = payload.old;
    if (oldClient?.status !== updatedClient.status || 
        oldClient?.mrr !== updatedClient.mrr ||
        oldClient?.progress !== updatedClient.progress) {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.counts() });
    }
  }, [queryClient]);

  const handleClientDelete = useCallback((payload: any) => {
    const deletedId = payload.old?.id;
    if (!deletedId) return;

    // Remove from cache
    queryClient.removeQueries({ queryKey: clientQueryKeys.detail(deletedId) });
    
    // Remove from all lists
    queryClient.setQueriesData(
      { queryKey: clientQueryKeys.lists() },
      (old: Client[] | undefined) => old ? old.filter(client => client.id !== deletedId) : old
    );

    // Invalidate metrics and counts
    queryClient.invalidateQueries({ queryKey: clientQueryKeys.metrics() });
    queryClient.invalidateQueries({ queryKey: clientQueryKeys.counts() });
  }, [queryClient]);

  useEffect(() => {
    // Subscribe to client table changes
    const channel = supabase
      .channel('client-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
        },
        handleClientInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clients',
        },
        handleClientUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'clients',
        },
        handleClientDelete
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleClientInsert, handleClientUpdate, handleClientDelete]);

  return {
    // Expose manual refresh capability
    refresh: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
    }, [queryClient]),
  };
}