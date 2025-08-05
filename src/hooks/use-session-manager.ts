
import { useState, useEffect } from 'react';
import { UseSessionManagerOptions, SessionManager } from '@/contexts/auth/types';

export function useSessionManager({
  sessionTimeoutMinutes,
  onExpired,
  onInactive
}: UseSessionManagerOptions): SessionManager {
  const [sessionExpiryTime, setSessionExpiryTime] = useState<Date | null>(null);
  
  // Temporarily disable the session manager to fix infinite loop
  // TODO: Re-implement with proper session handling
  
  return { sessionExpiryTime: null };
}
