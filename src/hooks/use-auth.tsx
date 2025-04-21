
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from "@/contexts/AuthContext";

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: Error | null;
}

// Main auth hook to be used across the application
export function useAuth() {
  console.log("Using auth hook");
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  console.log("Auth context:", {
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    userExists: !!context.user
  });
  
  return context;
}

// Only using the context-based authentication approach
// Removing direct auth hook implementation to avoid confusion
