
import { useState, useEffect, useContext, useCallback } from 'react';
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

// Instead of trying to re-export types from AuthContext,
// we'll directly reference the interface from the context file
// and export our own types that match the context structure
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, inviteCode: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  validateInviteCode: (code: string) => Promise<boolean>;
}
