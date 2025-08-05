import { supabase } from '@/integrations/supabase/client';

// Profiles and Users
export const getProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, user_roles(role)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// User Roles
export const getUserRoles = async (userId?: string) => {
  let query = supabase
    .from('user_roles')
    .select('*, profiles(first_name, last_name, email)');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const assignUserRole = async (userId: string, role: 'admin' | 'manager' | 'user') => {
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role, assigned_by: (await supabase.auth.getUser()).data.user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Tasks with user info
export const getTasksWithDetails = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_to_profile:profiles!tasks_assigned_to_fkey(first_name, last_name, email),
      assigned_by_profile:profiles!tasks_assigned_by_fkey(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Communications with details
export const getCommunicationsWithDetails = async () => {
  const { data, error } = await supabase
    .from('communications')
    .select(`
      *,
      sent_by_profile:profiles!communications_sent_by_fkey(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data;
};

// Renewal Forecasts
export const getRenewalForecasts = async () => {
  const { data, error } = await supabase
    .from('renewal_forecasts')
    .select('*')
    .order('renewal_date', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Backend Offers
export const getBackendOffers = async () => {
  const { data, error } = await supabase
    .from('backend_offers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Notifications
export const getNotifications = async (userId?: string) => {
  const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createNotification = async (notification: {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  related_table?: string;
  related_id?: string;
}) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Analytics queries
export const getDashboardStats = async () => {
  // Get task counts by status
  const { data: taskStats } = await supabase
    .from('tasks')
    .select('status')
    .neq('status', 'completed');

  // Get recent communications count
  const { data: recentComms } = await supabase
    .from('communications')
    .select('id')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Get upcoming renewals
  const { data: upcomingRenewals } = await supabase
    .from('renewal_forecasts')
    .select('*')
    .gte('renewal_date', new Date().toISOString())
    .lte('renewal_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

  // Get pending offers
  const { data: pendingOffers } = await supabase
    .from('backend_offers')
    .select('*')
    .eq('status', 'sent');

  return {
    pendingTasks: taskStats?.length || 0,
    recentCommunications: recentComms?.length || 0,
    upcomingRenewals: upcomingRenewals?.length || 0,
    pendingOffers: pendingOffers?.length || 0
  };
};