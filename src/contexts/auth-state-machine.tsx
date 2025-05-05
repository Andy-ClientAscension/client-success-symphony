
import React, { createContext, useContext, useCallback } from "react";
import { useAuthStateMachine } from "@/hooks/use-auth-state-machine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, AuthError } from '@supabase/supabase-js';

// Create context with default values
const AuthStateMachineContext = createContext<ReturnType<typeof useAuthStateMachine> | undefined>(undefined);

// Provider component
export function AuthStateMachineProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const authStateMachine = useAuthStateMachine();
  const { dispatch, withAuthTimeout } = authStateMachine;
  
  // Enhanced session check that uses our timeout mechanisms
  const checkSession = useCallback(async (forceRefresh = false) => {
    try {
      dispatch({ type: 'SESSION_CHECK_START' });
      
      const { data, error } = await withAuthTimeout(
        supabase.auth.getSession(),
        2000
      );
      
      if (error) {
        console.error("Session check error:", error);
        dispatch({ 
          type: 'SESSION_CHECK_FAILURE',
          error: new Error(error.message) 
        });
        return false;
      }
      
      if (data.session) {
        dispatch({ type: 'SESSION_CHECK_SUCCESS' });
        
        // Only show toast on forced refresh
        if (forceRefresh) {
          toast({
            title: "Session verified",
            description: "Your authentication has been refreshed",
          });
        }
        
        return true;
      } else {
        dispatch({ type: 'SESSION_CHECK_FAILURE' });
        return false;
      }
    } catch (error) {
      console.error("Session check exception:", error);
      
      // Show toast only for non-timeout errors
      if (error instanceof Error && !error.message.includes('timed out') && !error.message.includes('cancelled')) {
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "Failed to verify session",
          variant: "destructive"
        });
      }
      
      dispatch({ 
        type: 'SESSION_CHECK_FAILURE',
        error: error instanceof Error ? error : new Error('Session check failed')
      });
      
      return false;
    }
  }, [dispatch, withAuthTimeout, toast]);
  
  // Enhanced authentication helper with timeout handling
  const authenticateWithToken = useCallback(async (accessToken: string, refreshToken?: string) => {
    try {
      dispatch({ type: 'TOKEN_CHECK_START' });
      
      const { data, error } = await withAuthTimeout(
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }),
        3000
      );
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        dispatch({ type: 'AUTHENTICATE_SUCCESS' });
        toast({
          title: "Authentication successful",
          description: "You have been logged in successfully"
        });
        return true;
      } else {
        throw new Error("No session returned from authentication");
      }
    } catch (error) {
      console.error("Token authentication error:", error);
      
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to authenticate with token",
        variant: "destructive"
      });
      
      dispatch({ 
        type: 'AUTHENTICATE_FAILURE',
        error: error instanceof Error ? error : new Error('Token authentication failed')
      });
      
      return false;
    }
  }, [dispatch, withAuthTimeout, toast]);
  
  // Enhanced logout with timeout and state management
  const logout = useCallback(async () => {
    try {
      // Note: we don't dispatch a specific logout action as this is handled by Supabase's
      // auth state change event which will trigger a SESSION_CHECK_FAILURE
      
      await withAuthTimeout(
        supabase.auth.signOut(),
        2000
      );
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      
      toast({
        title: "Logout Error",
        description: error instanceof Error ? error.message : "Failed to log out",
        variant: "destructive"
      });
      
      return false;
    }
  }, [withAuthTimeout, toast]);
  
  // Create a merged value that includes our additional helper methods
  const contextValue = {
    ...authStateMachine,
    checkSession,
    authenticateWithToken,
    logout
  };
  
  return (
    <AuthStateMachineContext.Provider value={contextValue}>
      {children}
    </AuthStateMachineContext.Provider>
  );
}

// Hook to use the auth state machine context with proper typing
export function useAuthStateMachineContext() {
  const context = useContext(AuthStateMachineContext);
  
  if (context === undefined) {
    throw new Error("useAuthStateMachineContext must be used within an AuthStateMachineProvider");
  }
  
  return context;
}
