import { supabase } from '@/integrations/supabase/client';

export async function createTestNotifications() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('No authenticated user found');
      return;
    }

    const notifications = [
      {
        user_id: user.user.id,
        title: 'Welcome to Client Ascension',
        message: 'Your dashboard has been updated with the latest features including search and notifications.',
        type: 'info',
        read: false,
        related_table: 'dashboard'
      },
      {
        user_id: user.user.id,
        title: 'New Feature: AI Insights',
        message: 'Check out the new AI dashboard for advanced analytics and predictions.',
        type: 'success',
        read: false,
        related_table: 'features'
      },
      {
        user_id: user.user.id,
        title: 'Client Update',
        message: 'John Doe\'s health score has improved to 8.5/10.',
        type: 'success',
        read: true,
        related_table: 'clients'
      }
    ];

    for (const notification of notifications) {
      const { error } = await supabase
        .from('notifications')
        .insert(notification);
      
      if (error) {
        console.error('Error creating notification:', error);
      }
    }

    console.log('Test notifications created successfully');
  } catch (error) {
    console.error('Error creating test notifications:', error);
  }
}

export async function clearTestNotifications() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error clearing notifications:', error);
    } else {
      console.log('Test notifications cleared');
    }
  } catch (error) {
    console.error('Error clearing test notifications:', error);
  }
}