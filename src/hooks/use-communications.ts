
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tasks } from '@/types/tasks';
import { useAuth } from './use-auth';

export function useCommunications() {
  const [communications, setCommunications] = useState<Tasks.Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCommunications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Type-cast the communications data
      setCommunications((data || []).map(comm => ({
        ...comm,
        type: comm.type as Tasks.Communication['type']
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch communications');
    } finally {
      setIsLoading(false);
    }
  };

  const createCommunication = async (communicationData: Omit<Tasks.Communication, 'id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('communications')
        .insert({
          ...communicationData,
          sent_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Type-cast the new communication
      const typedComm: Tasks.Communication = {
        ...data,
        type: data.type as Tasks.Communication['type']
      };

      setCommunications(prev => [typedComm, ...prev]);
      return typedComm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create communication');
      return null;
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, [user]);

  return {
    communications,
    isLoading,
    error,
    createCommunication,
    refetch: fetchCommunications
  };
}
