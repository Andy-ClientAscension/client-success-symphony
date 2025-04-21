
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
    const error = new Error("useAuth must be used within an AuthProvider");
    console.error(error);
    throw error;
  }
  
  const { isAuthenticated, isLoading, user } = context;

  console.log("Auth context:", {
    isAuthenticated,
    isLoading,
    userExists: !!user,
    error: context.error?.message
  });
  
  return context;
}

// Only using the context-based authentication approach
// Removing direct auth hook implementation to avoid confusion
