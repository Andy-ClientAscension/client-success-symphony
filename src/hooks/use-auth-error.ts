
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export function useAuthError() {
  const { error: authError, isLoading } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (authError && !isLoading) {
      setError(authError);
    } else {
      setError(null);
    }
  }, [authError, isLoading]);
  
  return [error, setError] as const;
}
