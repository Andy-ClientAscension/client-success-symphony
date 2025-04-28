
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import type Auth from '@/types/auth';

// Main auth hook to be used across the application
export function useAuth(): Auth.AuthContextType {
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

// Utility function to check if a user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Utility function to get the current user
export function useCurrentUser(): Auth.User | null {
  const { user } = useAuth();
  return user;
}

// Utility function to get the login/logout functions
export function useAuthActions() {
  const { login, logout, register } = useAuth();
  return { login, logout, register };
}
