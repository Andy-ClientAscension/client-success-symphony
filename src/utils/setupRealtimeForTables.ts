
import { supabase } from '@/integrations/supabase/client';

/**
 * List of tables that should have real-time enabled
 * This is for documentation purposes - actual SQL commands would need to be run
 * in the Supabase SQL editor
 */
export const REALTIME_TABLES = [
  'communications',
  'renewal_forecasts',
  'backend_offers',
  'tasks'
];

/**
 * SQL required to enable real-time for tables:
 * 
 * -- For each table:
 * ALTER TABLE public.communications REPLICA IDENTITY FULL;
 * ALTER PUBLICATION supabase_realtime ADD TABLE public.communications;
 * 
 * ALTER TABLE public.renewal_forecasts REPLICA IDENTITY FULL;
 * ALTER PUBLICATION supabase_realtime ADD TABLE public.renewal_forecasts;
 * 
 * ALTER TABLE public.backend_offers REPLICA IDENTITY FULL;
 * ALTER PUBLICATION supabase_realtime ADD TABLE public.backend_offers;
 * 
 * ALTER TABLE public.tasks REPLICA IDENTITY FULL;
 * ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
 */

/**
 * Check if realtime channel is functioning
 */
export async function testRealtimeConnection(): Promise<boolean> {
  try {
    let connected = false;
    
    const channel = supabase.channel('test-realtime')
      .on('system', { event: 'test' }, () => {
        connected = true;
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connected = true;
        }
      });
    
    // Wait for 2 seconds to see if connection is established
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clean up
    supabase.removeChannel(channel);
    
    return connected;
  } catch (error) {
    console.error('Error testing realtime connection:', error);
    return false;
  }
}
