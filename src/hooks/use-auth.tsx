
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import type Auth from '@/types/auth';

// Main auth hook to be used across the application
export function useAuth(): Auth.AuthContextType {
  console.log("Using auth hook");
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    const error = new Error("useAuth must be used within an AuthProvider");
    console.error(error);
    throw error;
  }
  
  return context;
}

// Export types for backwards compatibility
export type User = Auth.User;
export type AuthContextType = Auth.AuthContextType;
export type AuthState = Auth.AuthState;
