
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '@/utils/corsHeaders';

// Initialize the Supabase client
const supabaseUrl = 'https://bajfdvphpoopkmpgzyeo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhamZkdnBocG9vcGttcGd6eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM5NTYsImV4cCI6MjA2MDI4OTk1Nn0.QJ7M2iBALcCy_bvJXAIbwFZ8JDh0G3O-t_IgBfDTikE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

/**
 * Helper function to fetch with CORS headers
 */
async function fetchWithCors(url, options = {}) {
  const timeout = 5000; // 5 second timeout
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...corsHeaders
      },
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Reset password function
 */
export async function resetPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send password reset email' 
    };
  }
}

/**
 * Check network connectivity
 */
export async function checkNetworkConnectivity() {
  try {
    // First check basic browser connectivity
    if (!navigator.onLine) {
      return { online: false, status: 'browser-offline' };
    }
    
    // Use ping endpoint to test real connectivity to Supabase
    const startTime = Date.now();
    
    // Set a short timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const response = await fetch(`${supabaseUrl}/ping`, {
        method: 'GET',
        headers: corsHeaders,
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      // Calculate latency
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        return { online: true, latency, status: response.status };
      } else {
        return { online: false, latency, status: response.status };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // If timeout or abort error, return timeout status
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return { online: false, status: 'timeout' };
      }
      
      // For fetch errors (like CORS, network errors), show more details
      console.error("Network connectivity fetch error:", fetchError);
      return { 
        online: false, 
        status: fetchError instanceof Error ? fetchError.name : 'error',
        errorMessage: fetchError instanceof Error ? fetchError.message : String(fetchError)
      };
    }
  } catch (error) {
    console.error("Network connectivity error:", error);
    return { 
      online: false, 
      status: 'error',
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Diagnose authentication issues
 */
export async function diagnoseAuthIssue() {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return { issue: "Supabase client not initialized" };
    }

    // Try to get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return { 
        issue: "Error retrieving session", 
        details: sessionError.message,
        code: sessionError.code || 'unknown'
      };
    }
    
    if (sessionData && sessionData.session) {
      return { 
        issue: "Session exists but not recognized by app", 
        sessionExpires: sessionData.session.expires_at,
        hasExpired: sessionData.session.expires_at * 1000 < Date.now(),
      };
    }

    // Check if we can retrieve user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return { 
        issue: "Error retrieving user", 
        details: userError.message,
        code: userError.code || 'unknown'
      };
    }
    
    if (userData && userData.user) {
      return { 
        issue: "User exists but no session", 
        details: "User may need to login again",
        emailConfirmed: userData.user.email_confirmed_at !== null
      };
    }

    // If we get here, no obvious issues found
    return {
      issue: "No authentication data found",
      details: "User may need to sign up or login",
      browserStorage: localStorage && localStorage.getItem('sb-bajfdvphpoopkmpgzyeo-auth-token') ? "Auth token found in localStorage" : "No auth token in localStorage"
    };
  } catch (error) {
    console.error("Auth diagnosis error:", error);
    return {
      issue: "Error during authentication diagnosis",
      details: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.name : 'unknown'
    };
  }
}

export default supabase;
