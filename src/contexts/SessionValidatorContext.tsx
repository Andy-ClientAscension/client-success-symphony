
import React, { createContext, useContext } from 'react';
import useSessionValidation from '@/hooks/useSessionValidator';

interface SessionValidatorProps {
  children: React.ReactNode;
}

interface SessionValidatorContextType {
  validating: boolean;
  lastValidated: Date | null;
  validationError: Error | null;
  validateSession: () => Promise<void>;
}

const SessionValidatorContext = createContext<SessionValidatorContextType | undefined>(undefined);

export function SessionValidatorProvider({ children }: SessionValidatorProps) {
  const validator = useSessionValidation();
  
  return (
    <SessionValidatorContext.Provider value={validator}>
      {children}
    </SessionValidatorContext.Provider>
  );
}

export function useSessionValidator() {
  const context = useContext(SessionValidatorContext);
  
  if (context === undefined) {
    throw new Error("useSessionValidator must be used within a SessionValidatorProvider");
  }
  
  return context;
}
