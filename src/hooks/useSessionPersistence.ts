import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionPersistence {
  rememberMe: boolean;
  lastLoginTime: number;
  sessionExpiry: number;
}

export function useSessionPersistence() {
  const [rememberMe, setRememberMe] = useState(false);

  // Load remember me preference on mount
  useEffect(() => {
    const stored = localStorage.getItem('session_persistence');
    if (stored) {
      try {
        const data: SessionPersistence = JSON.parse(stored);
        setRememberMe(data.rememberMe);
      } catch (error) {
        console.error('Failed to parse session persistence data:', error);
      }
    }
  }, []);

  const enableRememberMe = (enabled: boolean) => {
    setRememberMe(enabled);
    
    const persistenceData: SessionPersistence = {
      rememberMe: enabled,
      lastLoginTime: Date.now(),
      sessionExpiry: enabled ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (4 * 60 * 60 * 1000) // 30 days vs 4 hours
    };

    localStorage.setItem('session_persistence', JSON.stringify(persistenceData));
  };

  const isSessionValid = (): boolean => {
    const stored = localStorage.getItem('session_persistence');
    if (!stored) return false;

    try {
      const data: SessionPersistence = JSON.parse(stored);
      return Date.now() < data.sessionExpiry;
    } catch {
      return false;
    }
  };

  const clearPersistence = () => {
    localStorage.removeItem('session_persistence');
    setRememberMe(false);
  };

  return {
    rememberMe,
    enableRememberMe,
    isSessionValid,
    clearPersistence
  };
}