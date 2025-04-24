
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '@/utils/corsHeaders';

// Ensure the Supabase client is configured with CORS headers
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      ...corsHeaders
    }
  }
});
