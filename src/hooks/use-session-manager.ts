
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface SessionManagerOptions {
  autoRefresh?: boolean;
  refreshThresholdMinutes?: number;
  sessionTimeoutMinutes?: number;
  onExpired?: () => void;
  onInactive?: () => void;
}

export function useSessionManager(options: SessionManagerOptions = {}) {
  const {
    autoRefresh = true,
    refreshThresholdMinutes = 5,
    sessionTimeoutMinutes = 30,
    onExpired,
    onInactive
  } = options;
  
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [sessionExpiryTime, setSessionExpiryTime] = useState<Date | null>(null);
  const [warningShown, setWarningShown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Detect user activity
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleUserActivity = () => {
      setLastActivity(new Date());
      setWarningShown(false);
    };
    
    // Attach listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Clean up
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  // Session management
  useEffect(() => {
    // Check current session
    const checkSessionExpiry = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (session && session.expires_at) {
        const expiryTime = new Date(session.expires_at * 1000);
        setSessionExpiryTime(expiryTime);
      } else {
        setSessionExpiryTime(null);
      }
    };
    
    checkSessionExpiry();
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.expires_at) {
        const expiryTime = new Date(session.expires_at * 1000);
        setSessionExpiryTime(expiryTime);
        setWarningShown(false);
      } else if (event === 'SIGNED_OUT') {
        setSessionExpiryTime(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for session expiry and inactivity
  useEffect(() => {
    if (!sessionExpiryTime) return;
    
    const checkInterval = setInterval(() => {
      const now = new Date();
      
      // Check for session expiry
      if (sessionExpiryTime && now > sessionExpiryTime) {
        clearInterval(checkInterval);
        
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        
        // Handle session expiry
        if (onExpired) {
          onExpired();
        } else {
          supabase.auth.signOut().then(() => {
            navigate('/login');
          });
        }
        
        return;
      }
      
      // Check for inactivity
      const inactiveTime = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      // If inactive for too long
      if (inactiveTime > sessionTimeoutMinutes) {
        clearInterval(checkInterval);
        
        toast({
          title: "Session Timeout",
          description: "You've been logged out due to inactivity.",
          variant: "destructive"
        });
        
        // Handle inactivity timeout
        if (onInactive) {
          onInactive();
        } else {
          supabase.auth.signOut().then(() => {
            navigate('/login');
          });
        }
        
        return;
      }
      
      // Show warning before timeout
      if (inactiveTime > (sessionTimeoutMinutes - 2) && !warningShown) {
        setWarningShown(true);
        
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire due to inactivity. Please save your work.",
          duration: 10000,
        });
      }
      
      // Auto refresh token if needed
      if (autoRefresh && sessionExpiryTime) {
        const minutesUntilExpiry = (sessionExpiryTime.getTime() - now.getTime()) / (1000 * 60);
        
        if (minutesUntilExpiry < refreshThresholdMinutes && !isRefreshing) {
          setIsRefreshing(true);
          
          // Refresh the session
          supabase.auth.refreshSession().then(({ data, error }) => {
            setIsRefreshing(false);
            
            if (error) {
              console.error("Failed to refresh session:", error);
              toast({
                title: "Session Refresh Failed",
                description: "Unable to extend your session. You might be logged out soon.",
                variant: "destructive"
              });
            } else if (data.session) {
              const newExpiryTime = new Date(data.session.expires_at * 1000);
              setSessionExpiryTime(newExpiryTime);
              console.log("Session refreshed successfully, new expiry:", newExpiryTime);
            }
          });
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(checkInterval);
  }, [sessionExpiryTime, lastActivity, warningShown, isRefreshing, navigate, toast, onExpired, onInactive, autoRefresh, refreshThresholdMinutes, sessionTimeoutMinutes]);

  return {
    sessionExpiryTime,
    lastActivity,
    isSessionActive: !!sessionExpiryTime && new Date() < sessionExpiryTime,
    refreshSession: async () => {
      setIsRefreshing(true);
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        if (data.session) {
          setSessionExpiryTime(new Date(data.session.expires_at * 1000));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Manual session refresh failed:", error);
        return false;
      } finally {
        setIsRefreshing(false);
      }
    }
  };
}
