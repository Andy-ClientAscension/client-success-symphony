
import React, { createContext, useContext } from "react";
import { useAuthStateMachine } from "@/hooks/use-auth-state-machine";

// Create context with default values
const AuthStateMachineContext = createContext<ReturnType<typeof useAuthStateMachine> | undefined>(undefined);

// Provider component
export function AuthStateMachineProvider({ children }: { children: React.ReactNode }) {
  const authStateMachine = useAuthStateMachine();
  
  return (
    <AuthStateMachineContext.Provider value={authStateMachine}>
      {children}
    </AuthStateMachineContext.Provider>
  );
}

// Hook to use the auth state machine context
export function useAuthStateMachineContext() {
  const context = useContext(AuthStateMachineContext);
  
  if (context === undefined) {
    throw new Error("useAuthStateMachineContext must be used within an AuthStateMachineProvider");
  }
  
  return context;
}
