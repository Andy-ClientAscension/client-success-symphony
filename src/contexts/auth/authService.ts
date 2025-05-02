
import { supabase } from "@/integrations/supabase/client";
import { updateSentryUser } from "@/utils/sentry/config";
import { validateInviteCode } from "./inviteCodeUtils";
import type { Auth } from "./types";

// Function to refresh the auth state from Supabase
export const refreshAuthState = async (): Promise<void> => {
  try {
    console.log("Refreshing auth state from Supabase");
    
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error refreshing session:", sessionError);
      throw sessionError;
    }
    
    // Return the session data for the context to handle
    return Promise.resolve();
  } catch (error) {
    console.error("Session refresh error:", error);
    return Promise.reject(error);
  }
};

// Handle login
export const login = async (email: string, password: string): Promise<Auth.AuthResult> => {
  try {
    console.log("Login attempt for:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Supabase auth error:", error);
      return {
        success: false,
        error: new Error(error.message),
        session: null,
        user: null
      };
    }

    if (data.session) {
      console.log("Login successful, session established");
      return {
        success: true,
        error: null,
        session: data.session,
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name
        }
      };
    }

    return {
      success: false,
      error: new Error("Login failed for unknown reason"),
      session: null,
      user: null
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Login failed"),
      session: null,
      user: null
    };
  }
};

// Handle registration
export const register = async (
  email: string, 
  password: string, 
  inviteCode: string
): Promise<{ success: boolean; message: string; session: any; user: Auth.User | null }> => {
  try {
    console.log("Registration attempt for:", email);

    // Validate invite code first
    const isValidCode = await validateInviteCode(inviteCode);
    if (!isValidCode) {
      return {
        success: false,
        message: "Invalid invitation code",
        session: null,
        user: null
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;

    if (data.user) {
      if (data.session) {
        return {
          success: true,
          message: "Registration successful! You are now logged in.",
          session: data.session,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name
          }
        };
      } else if (data.user.identities?.length === 0) {
        // User already exists
        return {
          success: false,
          message: "This email is already registered. Please login instead.",
          session: null,
          user: null
        };
      } else {
        // Email confirmation is required
        return {
          success: true,
          message: "Registration successful! Please check your email to confirm your account.",
          session: null,
          user: null
        };
      }
    }

    return {
      success: false,
      message: "Registration failed for unknown reason",
      session: null,
      user: null
    };
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("already registered")) {
        return {
          success: false,
          message: "This email is already registered. Please login instead.",
          session: null,
          user: null
        };
      }
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
      session: null, 
      user: null
    };
  }
};

// Handle logout
export const logout = async (): Promise<void> => {
  try {
    console.log("Logging out user");
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error("Error during sign out:", signOutError);
      throw signOutError;
    }
    
    // Update Sentry user context
    updateSentryUser(null);
    
    return Promise.resolve();
  } catch (error) {
    console.error("Logout error:", error);
    return Promise.reject(error);
  }
};

// Check if a session is expired
export const isSessionExpired = (session: any): boolean => {
  return session?.expires_at 
    ? session.expires_at * 1000 < Date.now()
    : false;
};
