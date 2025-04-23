
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tasks } from '@/types/tasks';
import { useAuth } from './use-auth';

export function useTasks() {
  const [tasks, setTasks] = useState<Tasks.Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id}`);

      if (error) throw error;

      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Tasks.Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          assigned_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Tasks.Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => 
        prev.map(task => task.id === taskId ? data : task)
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    refetch: fetchTasks
  };
}
