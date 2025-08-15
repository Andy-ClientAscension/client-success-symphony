
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '@/utils/corsHeaders';
import { cacheSession, getCachedSession, clearCachedSession } from '@/utils/sessionCache';
import { getDevelopmentFallbacks } from '@/utils/envValidator';
import { isAborted } from '@/utils/abortUtils';

// Singleton instance
let supabaseInstance = null;

// Use direct hardcoded configuration for development
const supabaseUrl = 'https://bajfdvphpoopkmpgzyeo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhamZkdnBocG9vcGttcGd6eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM5NTYsImV4cCI6MjA2MDI4OTk1Nn0.QJ7M2iBALcCy_bvJXAIbwFZ8JDh0G3O-t_IgBfDTikE';

// Memoized client creation function
export const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Define the site URL for redirection handling
  const siteUrl = window.location.origin;

  // Enhanced fetch function with CORS headers and timeout
  const fetchWithCors = (url: RequestInfo | URL, options?: RequestInit) => {
    // Use existing abort controller if provided, otherwise create a new one
    const existingSignal = options?.signal;
    const controller = existingSignal ? null : new AbortController();
    const signal = existingSignal || controller?.signal;
    
    // Set a timeout for the request if we created a controller
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (controller) {
      const timeout = 10000; // 10 second timeout
      timeoutId = setTimeout(() => {
        // Only abort if not already aborted
        if (!isAborted(signal)) {
          controller.abort('Request timeout');
        }
      }, timeout);
    }
    
    // Merge existing headers with CORS headers
    const headers = {
      ...(options?.headers || {}),
      ...corsHeaders,
    };
    
    // Execute the fetch with our custom signal
    return fetch(url, {
      ...options,
      headers,
      signal,
      mode: 'cors',
    }).finally(() => {
      // Clear the timeout when fetch completes (success or error)
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  };

  // Create the singleton instance
  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: corsHeaders,
      fetch: fetchWithCors
    }
  });

  // Configure the site URL in localStorage for Supabase
  localStorage.setItem('supabase.auth.site_url', siteUrl);

  return supabaseInstance;
};

// Export the singleton instance for direct imports
export const supabase = getSupabaseClient();

/**
 * Helper function to fetch with CORS headers
 */
async function fetchWithCorsOriginal(url: string, options: RequestInit = {}) {
  // Use existing abort controller if provided, otherwise create a new one
  const existingSignal = options?.signal;
  const controller = existingSignal ? null : new AbortController();
  const signal = existingSignal || controller?.signal;
  
  // Set a timeout if we created our own controller
  let timeoutId: NodeJS.Timeout | undefined;
  
  if (controller) {
    const timeout = 5000; // 5 second timeout
    timeoutId = setTimeout(() => {
      if (!isAborted(signal)) {
        controller.abort('Request timeout');
      }
    }, timeout);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...corsHeaders,
        'apikey': supabaseKey // Using hardcoded key
      },
      signal,
      mode: 'cors'
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return response;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Rethrow non-abort errors
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      throw error;
    }
    
    // For abort errors, rethrow only if it wasn't our own abort
    if (existingSignal) {
      throw error;
    }
    
    // Otherwise, create a more informative timeout error
    throw new Error('Request timed out after 5000ms');
  }
}

/**
 * Enhanced login function for authentication with session caching
 */
export async function login(email: string, password: string) {
  try {
    // First, check network connectivity to avoid failed attempts
    const networkStatus = await checkNetworkConnectivity();
    if (!networkStatus.online) {
      console.error("Network appears offline, cannot proceed with login");
      return {
        success: false,
        error: 'Network connectivity issue. Please check your connection and try again.'
      };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Login error:", error.message, error.code);
      
      // Enhanced error handling with user-friendly messages
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email address before logging in. Check your inbox for a confirmation email.',
          code: 'email_not_confirmed'
        };
      } else if (error.message.includes('Invalid login')) {
        return {
          success: false,
          error: 'Invalid email or password. Please try again.',
          code: 'invalid_credentials'
        };
      } else if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Too many login attempts. Please try again later.',
          code: 'rate_limited'
        };
      }
      
      throw error;
    }
    
    // Cache the session data with expiry time (30 minutes)
    if (data && data.session) {
      cacheSession(data.session, 30 * 60 * 1000);
    }
    
    return { 
      success: true, 
      user: data.user 
    };
  } catch (error) {
    console.error('Login error:', error);
    // Check for network-related errors
    if (error instanceof Error && 
        (error.message.includes('fetch') || 
         error.message.includes('network') || 
         error.message.includes('offline'))) {
      return {
        success: false,
        error: 'Network connectivity issue. Please check your connection and try again.',
        code: 'network_error'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
      code: 'unknown_error'
    };
  }
}

/**
 * Get user session with caching to reduce API calls 
 */
export async function getCachedUserSession() {
  try {
    // Check for cached session first
    const cachedSession = getCachedSession();
    if (cachedSession) {
      console.log("Using cached session");
      return { 
        data: { session: cachedSession },
        error: null
      };
    }
    
    // If no cached session, fetch from Supabase
    console.log("No cached session, fetching from API");
    const { data, error } = await supabase.auth.getSession();
    
    // Cache the new session
    if (data.session) {
      cacheSession(data.session);
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error getting session:", error);
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error("Failed to get session")
    };
  }
}

// Update logout function to clear cached session
const originalLogout = logout;
export async function logout() {
  clearCachedSession();
  return originalLogout();
}

/**
 * Reset password function with improved error handling
 */
export async function resetPassword(email: string) {
  try {
    // Check network connectivity first
    const networkStatus = await checkNetworkConnectivity();
    if (!networkStatus.online) {
      return { 
        success: false, 
        message: 'Network connectivity issue. Please check your connection and try again.',
        code: 'network_error'
      };
    }
    
    console.log("Sending password reset email to:", email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error.message);
      
      // Enhanced error handling with specific codes
      if (error.message.includes('rate limit')) {
        return { 
          success: false, 
          message: 'Too many requests. Please try again later.',
          code: 'rate_limited' 
        };
      } else if (error.message.includes('not found')) {
        return { 
          success: false, 
          message: 'Email address not found. Please check the email address and try again.',
          code: 'user_not_found' 
        };
      }
      
      return { 
        success: false, 
        message: error.message,
        code: error.code || 'unknown' 
      };
    }
    
    return { 
      success: true, 
      message: 'Password reset email sent successfully. Please check your inbox.',
      code: 'email_sent' 
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send password reset email',
      code: 'unknown_error'
    };
  }
}

/**
 * Check network connectivity with multiple fallback mechanisms
 */
export async function checkNetworkConnectivity() {
  try {
    // First check basic browser connectivity
    if (!navigator.onLine) {
      return { online: false, status: 'browser-offline' };
    }
    
    // Try multiple reliable endpoints with fallbacks
    const endpoints = [
      'https://www.google.com/generate_204',
      'https://www.cloudflare.com/cdn-cgi/trace',
      'https://httpbin.org/get'
    ];
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Try each endpoint until one succeeds
    for (const url of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          // Use no-cors mode as a last resort if regular fetch fails
          mode: url === endpoints[endpoints.length - 1] ? 'no-cors' : undefined,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        
        // For no-cors mode, we can't read the response but if we get here it means request didn't fail
        if (url === endpoints[endpoints.length - 1] && response.type === 'opaque') {
          return { online: true, latency, status: 'connectivity-verified-nocors' };
        }
        
        if (response.ok || response.status === 204) {
          return { online: true, latency, status: 'connected' };
        }
      } catch (fetchError) {
        // Continue to next endpoint if this one fails
        console.log(`Connectivity check to ${url} failed, trying next endpoint...`);
      }
    }
    
    clearTimeout(timeoutId);
    
    // If all endpoints failed but browser reports online, return ambiguous status
    if (navigator.onLine) {
      return { online: true, status: 'browser-only' };
    }
    
    return { online: false, status: 'all-endpoints-failed' };
  } catch (error) {
    console.error("Network connectivity error:", error);
    return { 
      online: navigator.onLine, // Fallback to browser's online status
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
