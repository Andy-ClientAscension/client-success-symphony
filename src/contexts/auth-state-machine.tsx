
import React, { createContext, useContext, useCallback, useRef, useEffect } from "react";
import { useAuthStateMachine, AuthStateMachineEvent } from "@/hooks/use-auth-state-machine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, AuthError } from '@supabase/supabase-js';
import { safeAbort, createAbortController } from "@/utils/abortUtils";

// Define the complete context type including all methods
type AuthStateMachineContextType = ReturnType<typeof useAuthStateMachine> & {
  checkSession: (forceRefresh?: boolean) => Promise<boolean>;
  authenticateWithToken: (accessToken: string, refreshToken?: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

// Create context with default values
const AuthStateMachineContext = createContext<AuthStateMachineContextType | undefined>(undefined);

// Provider component
export function AuthStateMachineProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const authStateMachine = useAuthStateMachine();
  const { dispatch, withAuthTimeout } = authStateMachine;
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingOperationsRef = useRef<Map<number, { controller: AbortController, timeoutId?: NodeJS.Timeout }>>(new Map());

  // Cleanup function for aborting ongoing requests
  useEffect(() => {
    return () => {
      // Abort all pending operations on unmount
      pendingOperationsRef.current.forEach(({ controller, timeoutId }) => {
        safeAbort(controller, 'Component unmounted');
        if (timeoutId) clearTimeout(timeoutId);
      });
      pendingOperationsRef.current.clear();
      
      if (abortControllerRef.current) {
        safeAbort(abortControllerRef.current, 'Component unmounted');
        abortControllerRef.current = null;
      }
    };
  }, []);
  
  // Helper to register and track operations
  const registerOperation = useCallback((operationId: number, controller: AbortController) => {
    pendingOperationsRef.current.set(operationId, { controller });
    return operationId;
  }, []);
  
  // Helper to complete operations
  const completeOperation = useCallback((operationId: number) => {
    const operation = pendingOperationsRef.current.get(operationId);
    if (operation) {
      const { timeoutId } = operation;
      if (timeoutId) clearTimeout(timeoutId);
      pendingOperationsRef.current.delete(operationId);
    }
  }, []);
  
  // Enhanced session check that uses our timeout mechanisms and abort controls
  const checkSession = useCallback(async (forceRefresh = false) => {
    // Abort any previous ongoing request
    if (abortControllerRef.current) {
      safeAbort(abortControllerRef.current, 'New session check requested');
    }

    // Create a new abort controller for this request
    const { controller, signal } = createAbortController();
    abortControllerRef.current = controller;
    const operationId = authStateMachine.operationId;
    
    // Register this operation
    registerOperation(operationId, controller);
    
    try {
      dispatch({ type: 'SESSION_CHECK_START' });
      
      // If component has unmounted or a new request has started, exit early
      if (signal.aborted) {
        throw new Error('Session check aborted');
      }
      
      // Properly type the response from getSession
      const { data, error } = await withAuthTimeout<{
        data: { session: Session | null },
        error: AuthError | null
      }>(
        supabase.auth.getSession(),
        2000
      );

      // Check if abort was requested during the API call
      if (signal.aborted) {
        throw new Error('Session check aborted after API call');
      }
      
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
        if (forceRefresh && !signal.aborted) {
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
      
      // Don't process errors if already aborted
      if (signal.aborted) {
        console.log("Session check aborted, skipping error handling");
        return false;
      }
      
      // Show toast only for non-timeout errors
      if (error instanceof Error && !error.message.includes('timed out') && 
          !error.message.includes('cancelled') && !error.message.includes('aborted')) {
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
    } finally {
      // Clear the reference if this is still the active controller
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      
      // Complete this operation
      completeOperation(operationId);
    }
  }, [dispatch, withAuthTimeout, toast, authStateMachine.operationId, registerOperation, completeOperation]);
  
  // Enhanced authentication helper with timeout and abort handling
  const authenticateWithToken = useCallback(async (accessToken: string, refreshToken?: string) => {
    // Abort any previous ongoing request
    if (abortControllerRef.current) {
      safeAbort(abortControllerRef.current, 'New authentication requested');
    }

    // Create a new abort controller for this request
    const { controller, signal } = createAbortController();
    abortControllerRef.current = controller;
    const operationId = authStateMachine.operationId;
    
    // Register this operation
    registerOperation(operationId, controller);
    
    try {
      dispatch({ type: 'TOKEN_CHECK_START' });
      
      // Exit early if abort was requested
      if (signal.aborted) {
        throw new Error('Authentication aborted');
      }
      
      // Properly type the response from setSession
      const { data, error } = await withAuthTimeout<{
        data: { session: Session | null, user: any | null },
        error: AuthError | null
      }>(
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }),
        3000
      );
      
      // Check if abort was requested during the API call
      if (signal.aborted) {
        throw new Error('Authentication aborted after API call');
      }
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        dispatch({ type: 'AUTHENTICATE_SUCCESS' });
        
        if (!signal.aborted) {
          toast({
            title: "Authentication successful",
            description: "You have been logged in successfully"
          });
        }
        
        return true;
      } else {
        throw new Error("No session returned from authentication");
      }
    } catch (error) {
      console.error("Token authentication error:", error);
      
      // Don't process errors if already aborted
      if (signal && signal.aborted) {
        console.log("Authentication aborted, skipping error handling");
        return false;
      }
      
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
    } finally {
      // Clear the reference if this is still the active controller
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      
      // Complete this operation
      completeOperation(operationId);
    }
  }, [dispatch, withAuthTimeout, toast, authStateMachine.operationId, registerOperation, completeOperation]);
  
  // Enhanced logout with timeout, abort control and state management
  const logout = useCallback(async () => {
    // Abort any previous ongoing request
    if (abortControllerRef.current) {
      safeAbort(abortControllerRef.current, 'Logout requested');
    }

    // Create a new abort controller for this request
    const { controller, signal } = createAbortController();
    abortControllerRef.current = controller;
    const operationId = authStateMachine.operationId;
    
    // Register this operation
    registerOperation(operationId, controller);
    
    try {
      // Note: we don't dispatch a specific logout action as this is handled by Supabase's
      // auth state change event which will trigger a SESSION_CHECK_FAILURE
      
      await withAuthTimeout(
        supabase.auth.signOut(),
        2000
      );
      
      // Check if abort was requested during the API call
      if (signal.aborted) {
        throw new Error('Logout aborted');
      }
      
      if (!signal.aborted) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account"
        });
      }
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      
      // Don't process errors if already aborted
      if (signal.aborted) {
        console.log("Logout aborted, skipping error handling");
        return false;
      }
      
      toast({
        title: "Logout Error",
        description: error instanceof Error ? error.message : "Failed to log out",
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Clear the reference if this is still the active controller
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      
      // Complete this operation
      completeOperation(operationId);
    }
  }, [withAuthTimeout, toast, authStateMachine.operationId, registerOperation, completeOperation]);
  
  // Create a merged value that includes our additional helper methods
  const contextValue: AuthStateMachineContextType = {
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
