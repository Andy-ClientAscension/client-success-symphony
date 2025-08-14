import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SSCCapacity {
  id: string;
  ssc_name: string;
  team: string;
  max_capacity: number;
  current_students: number;
  available_capacity: number;
  capacity_percentage: number;
  created_at: string;
  updated_at: string;
}

export function useSSCCapacities(team?: string) {
  const [capacities, setCapacities] = useState<SSCCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCapacities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ssc_capacities')
        .select('*')
        .order('capacity_percentage', { ascending: false });

      if (team) {
        query = query.eq('team', team);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setCapacities(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching SSC capacities:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('ssc_capacities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ssc_capacities'
        },
        () => {
          fetchCapacities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team]);

  return {
    capacities,
    loading,
    error,
    refetch: fetchCapacities
  };
}