
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
  
  return context;
}

// Export everything from the auth context for type safety
export type {
  User,
  AuthContextType
} from '@/contexts/AuthContext';
