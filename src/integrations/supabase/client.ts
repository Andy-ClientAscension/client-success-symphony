
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '@/utils/corsHeaders';

// Ensure the Supabase client is configured with CORS headers
const supabaseUrl = 'https://bajfdvphpoopkmpgzyeo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhamZkdnBocG9vcGttcGd6eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM5NTYsImV4cCI6MjA2MDI4OTk1Nn0.QJ7M2iBALcCy_bvJXAIbwFZ8JDh0G3O-t_IgBfDTikE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    // Add debug option to log auth events
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      ...corsHeaders
    }
  },
  // Add network error retry options
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Export helper function to check session status
export const checkSessionStatus = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return {
      valid: !!data.session,
      session: data.session,
      expiresAt: data.session?.expires_at
    };
  } catch (e) {
    console.error("Error checking session:", e);
    return { valid: false, session: null };
  }
};

// Add a helper function to reset the password
export const resetPassword = async (email: string) => {
  try {
    console.log("Requesting password reset for:", email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return { success: true, message: "Password reset instructions sent to your email." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { 
      success: false, 
      message: error instanceof Error 
        ? error.message 
        : "Failed to send password reset email. Please try again." 
    };
  }
};

// Add network connectivity check
export const checkNetworkConnectivity = async () => {
  try {
    // Simple ping to check if we can reach Supabase
    const start = Date.now();
    const response = await fetch(`${supabaseUrl}/ping`, { 
      method: 'GET',
      headers: corsHeaders,
      mode: 'cors'
    });
    const latency = Date.now() - start;
    
    return { 
      online: response.ok, 
      latency,
      status: response.status
    };
  } catch (error) {
    console.error("Network connectivity error:", error);
    return { 
      online: false, 
      latency: 0,
      error: error instanceof Error ? error.message : "Unknown network error"
    };
  }
};

// Add a function to help diagnose auth issues
export const diagnoseAuthIssue = async () => {
  try {
    // Check network
    const network = await checkNetworkConnectivity();
    if (!network.online) {
      return {
        issue: 'network',
        message: 'Network connectivity issue detected. Please check your internet connection.',
        details: network.error
      };
    }
    
    // Check session
    const session = await checkSessionStatus();
    
    return {
      issue: session.valid ? null : 'auth_session',
      network,
      session: {
        valid: session.valid,
        expiresIn: session.expiresAt ? new Date(session.expiresAt * 1000).toISOString() : null
      }
    };
  } catch (e) {
    return {
      issue: 'unknown',
      message: e instanceof Error ? e.message : 'Unknown error during diagnosis',
      network: { online: false }
    };
  }
};
