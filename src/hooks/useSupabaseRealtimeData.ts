import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UseSupabaseRealtimeDataOptions {
  table: string;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  enableToasts?: boolean;
}

export function useSupabaseRealtimeData<T>(options: UseSupabaseRealtimeDataOptions) {
  const { table, select = '*', orderBy, enableToasts = false } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from(table).select(select);
      
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(fetchedData || []);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${table}`;
      setError(errorMessage);
      console.error(`Error fetching ${table}:`, err);
      
      if (enableToasts) {
        toast.error(`Failed to load ${table}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [table, select, orderBy, enableToasts]);

  // Handle real-time changes
  const handleRealtimeChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setData(currentData => {
      switch (eventType) {
        case 'INSERT':
          if (enableToasts) {
            toast.success(`New ${table.slice(0, -1)} added`);
          }
          return [...currentData, newRecord as T];

        case 'UPDATE':
          if (enableToasts) {
            toast.info(`${table.slice(0, -1)} updated`);
          }
          return currentData.map(item => 
            (item as any).id === newRecord.id ? newRecord as T : item
          );

        case 'DELETE':
          if (enableToasts) {
            toast.error(`${table.slice(0, -1)} deleted`);
          }
          return currentData.filter(item => (item as any).id !== oldRecord.id);

        default:
          return currentData;
      }
    });

    setLastUpdated(new Date());
  }, [table, enableToasts]);

  // Set up real-time subscription
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        handleRealtimeChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, fetchData, handleRealtimeChange]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}