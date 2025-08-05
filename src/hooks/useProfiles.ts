import { useState, useEffect } from 'react';
import { getProfiles, updateProfile, getUserRoles, assignUserRole } from '@/lib/supabase-queries';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  user_roles: { role: 'admin' | 'manager' | 'user' }[];
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const updated = await updateProfile(id, updates);
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      return updated;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const changeUserRole = async (userId: string, role: 'admin' | 'manager' | 'user') => {
    try {
      await assignUserRole(userId, role);
      await loadProfiles(); // Reload to get updated roles
      toast({
        title: 'Success',
        description: `User role changed to ${role}`,
      });
    } catch (error) {
      console.error('Error changing user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to change user role',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    profiles,
    loading,
    updateUserProfile,
    changeUserRole,
    refresh: loadProfiles
  };
}