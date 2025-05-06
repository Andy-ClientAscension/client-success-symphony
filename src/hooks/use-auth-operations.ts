
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, AuthError } from '@supabase/supabase-js';
import { useOperationController } from './use-operation-controller';

/**
 * Hook for handling authentication operations with timeout and abort control
 */
export function useAuthOperations(withAuthTimeout: <T>(promise: Promise<T>, timeoutMs?: number) => Promise<T>, operationId: number) {
  const { toast } = useToast();
  const { registerOperation, completeOperation, getController, isMounted } = useOperationController();

  // Enhanced session check with timeout and abort control
  const checkSession = useCallback(async (forceRefresh = false) => {
    // Create a new abort controller for this request
    const { controller, signal } = getController('New session check requested');
    
    // Register this operation
    registerOperation(operationId, controller);
    
    try {
      // If component has unmounted, exit early
      if (signal.aborted) {
        throw new Error('Session check aborted');
      }
      
      // Properly type the response from getSession
      const { data, error } = await withAuthTimeout<{
        data: { session: Session | null },
        error: AuthError | null
      }>(
        supabase.auth.getSession(),
        2000
      );

      // Check if abort was requested during the API call
      if (signal.aborted) {
        throw new Error('Session check aborted after API call');
      }
      
      if (error) {
        console.error("Session check error:", error);
        return false;
      }
      
      if (data.session) {
        // Only show toast on forced refresh
        if (forceRefresh && !signal.aborted && isMounted()) {
          toast({
            title: "Session verified",
            description: "Your authentication has been refreshed",
          });
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Session check exception:", error);
      
      // Don't process errors if already aborted
      if (signal.aborted) {
        console.log("Session check aborted, skipping error handling");
        return false;
      }
      
      // Show toast only for non-timeout errors
      if (error instanceof Error && !error.message.includes('timed out') && 
          !error.message.includes('cancelled') && !error.message.includes('aborted')) {
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "Failed to verify session",
          variant: "destructive"
        });
      }
      
      return false;
    } finally {
      // Complete this operation
      completeOperation(operationId);
    }
  }, [withAuthTimeout, toast, operationId, registerOperation, completeOperation, getController, isMounted]);
  
  // Enhanced authentication with token
  const authenticateWithToken = useCallback(async (accessToken: string, refreshToken?: string) => {
    // Create a new abort controller for this request
    const { controller, signal } = getController('New authentication requested');
    
    // Register this operation
    registerOperation(operationId, controller);
    
    try {
      // Exit early if abort was requested
      if (signal.aborted) {
        throw new Error('Authentication aborted');
      }
      
      // Properly type the response from setSession
      const { data, error } = await withAuthTimeout<{
        data: { session: Session | null, user: any | null },
        error: AuthError | null
      }>(
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }),
        3000
      );
      
      // Check if abort was requested during the API call
      if (signal.aborted) {
        throw new Error('Authentication aborted after API call');
      }
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        if (!signal.aborted && isMounted()) {
          toast({
            title: "Authentication successful",
            description: "You have been logged in successfully"
          });
        }
        
        return true;
      } else {
        throw new Error("No session returned from authentication");
      }
    } catch (error) {
      console.error("Token authentication error:", error);
      
      // Don't process errors if already aborted
      if (signal && signal.aborted) {
        console.log("Authentication aborted, skipping error handling");
        return false;
      }
      
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to authenticate with token",
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Complete this operation
      completeOperation(operationId);
    }
  }, [withAuthTimeout, toast, operationId, registerOperation, completeOperation, getController, isMounted]);
  
  // Enhanced logout with abort control
  const logout = useCallback(async () => {
    // Create a new abort controller for this request
    const { controller, signal } = getController('Logout requested');
    
    // Register this operation
    registerOperation(operationId, controller);
    
    try {
      await withAuthTimeout(
        supabase.auth.signOut(),
        2000
      );
      
      // Check if abort was requested during the API call
      if (signal.aborted) {
        throw new Error('Logout aborted');
      }
      
      if (!signal.aborted && isMounted()) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account"
        });
      }
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      
      // Don't process errors if already aborted
      if (signal.aborted) {
        console.log("Logout aborted, skipping error handling");
        return false;
      }
      
      toast({
        title: "Logout Error",
        description: error instanceof Error ? error.message : "Failed to log out",
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Complete this operation
      completeOperation(operationId);
    }
  }, [withAuthTimeout, toast, operationId, registerOperation, completeOperation, getController, isMounted]);

  return {
    checkSession,
    authenticateWithToken,
    logout
  };
}
