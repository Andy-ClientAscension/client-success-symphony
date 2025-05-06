
import React, { createContext, useContext, useCallback } from "react";
import { useAuthStateMachine, AuthStateMachineEvent } from "@/hooks/use-auth-state-machine";
import { useAuthOperations } from "@/hooks/use-auth-operations";
import { useOperationController } from "@/hooks/use-operation-controller";

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
  // Get the core auth state machine
  const authStateMachine = useAuthStateMachine();
  const { withAuthTimeout, operationId } = authStateMachine;
  
  // Use the extracted operation controller
  useOperationController();
  
  // Use the extracted auth operations with improved timeout handling
  const authOperations = useAuthOperations(withAuthTimeout, operationId);
  
  // Create a merged value that includes our additional helper methods
  const contextValue: AuthStateMachineContextType = {
    ...authStateMachine,
    ...authOperations
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
