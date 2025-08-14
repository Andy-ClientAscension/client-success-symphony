import React from 'react';
import { AlertTriangle, Clock, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionStatusProps {
  sessionExpiryTime?: Date | null;
  onExtendSession?: () => void;
  onLogout?: () => void;
}

export function SessionStatus({ sessionExpiryTime, onExtendSession, onLogout }: SessionStatusProps) {
  if (!sessionExpiryTime) return null;

  const now = Date.now();
  const timeLeft = sessionExpiryTime.getTime() - now;
  
  // Don't show if more than 30 minutes left
  if (timeLeft > 30 * 60 * 1000) return null;
  
  const minutesLeft = Math.floor(timeLeft / (60 * 1000));
  const isExpiringSoon = timeLeft <= 10 * 60 * 1000; // 10 minutes
  const hasExpired = timeLeft <= 0;

  if (hasExpired) {
    return (
      <Alert variant="destructive" className="fixed top-4 right-4 w-auto max-w-md z-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Session expired. Please log in again.</span>
          <Button size="sm" variant="outline" onClick={onLogout}>
            Log In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isExpiringSoon) {
    return (
      <Alert variant="destructive" className="fixed top-4 right-4 w-auto max-w-md z-50">
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Session expires in {minutesLeft} minutes</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onExtendSession}>
              Extend
            </Button>
            <Button size="sm" variant="ghost" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="fixed bottom-4 right-4 w-auto max-w-md z-50">
      <Info className="h-4 w-4" />
      <AlertDescription>
        Session expires in {minutesLeft} minutes
      </AlertDescription>
    </Alert>
  );
}