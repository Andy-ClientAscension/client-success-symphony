
import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useAuthStateMachine } from "@/hooks/use-auth-state-machine";
import { useAuthOperations } from "@/hooks/use-auth-operations";
import { useOperationController } from "@/hooks/use-operation-controller";
import { useNavigate, useLocation } from "react-router-dom";

// Define the complete context type including all methods
type AuthStateMachineContextType = ReturnType<typeof useAuthStateMachine> & {
  checkSession: (forceRefresh?: boolean) => Promise<boolean>;
  authenticateWithToken: (accessToken: string, refreshToken?: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

// Define the event type for the dispatch function
export interface AuthStateMachineEvent {
  type: 'NAVIGATE_START' | 'NAVIGATE_COMPLETE' | string;
  [key: string]: any;
}

// Create context with default values
const AuthStateMachineContext = createContext<AuthStateMachineContextType | undefined>(undefined);

// Provider component
export function AuthStateMachineProvider({ children }: { children: React.ReactNode }) {
  // Get the core auth state machine
  const authStateMachine = useAuthStateMachine();
  const { withAuthTimeout, operationId, dispatch } = authStateMachine;
  const navigate = useNavigate();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Use the extracted operation controller
  useOperationController();
  
  // Use the extracted auth operations with improved timeout handling
  const authOperations = useAuthOperations(withAuthTimeout, operationId);
  
  // Create a merged value that includes our additional helper methods
  const contextValue: AuthStateMachineContextType = {
    ...authStateMachine,
    ...authOperations
  };

  // Handle navigation events for auth state machine
  useEffect(() => {
    // Notify state machine about navigation
    console.log("AuthStateMachineProvider: Navigation detected to", location.pathname);
    dispatch({ type: 'NAVIGATE_COMPLETE' });
    
    // Perform initial session check only once after provider is mounted
    // but only if not on auth-related paths
    if (!initialCheckDone && 
        location.pathname !== '/login' && 
        location.pathname !== '/signup' && 
        location.pathname !== '/auth-callback' &&
        location.pathname !== '/reset-password') {
      console.log("AuthStateMachineProvider: Performing initial session check");
      setInitialCheckDone(true);
      
      // Short delay to avoid race conditions with other init processes
      setTimeout(() => {
        authOperations.checkSession(false).catch(err => {
          console.error("Initial session check error:", err);
        });
      }, 300);
    }
  }, [location, dispatch, initialCheckDone, authOperations]);
  
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
