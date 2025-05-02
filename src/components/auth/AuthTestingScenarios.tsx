
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, RefreshCw, XCircle, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScenarioResult {
  title: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export function AuthTestingScenarios() {
  const { verifyMagicLink, refreshSession, tokenValidationState, lastAuthEvent } = useAuth();
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [testToken, setTestToken] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Log auth events
  useEffect(() => {
    if (lastAuthEvent) {
      const eventMap: Record<string, { title: string, status: 'success' | 'error' | 'warning' | 'info' }> = {
        'SIGNED_IN': { title: 'User Signed In', status: 'success' },
        'SIGNED_OUT': { title: 'User Signed Out', status: 'info' },
        'USER_UPDATED': { title: 'User Profile Updated', status: 'info' },
        'TOKEN_REFRESHED': { title: 'Authentication Token Refreshed', status: 'info' },
        'PASSWORD_RECOVERY': { title: 'Password Recovery Initiated', status: 'info' },
        'signin_from_other_tab': { title: 'Sign In from Another Tab', status: 'info' },
        'signout_from_other_tab': { title: 'Sign Out from Another Tab', status: 'warning' },
      };
      
      const eventInfo = eventMap[lastAuthEvent] || { title: `Auth Event: ${lastAuthEvent}`, status: 'info' };
      
      setResults(prev => [...prev, {
        title: eventInfo.title,
        status: eventInfo.status,
        message: `Event type: ${lastAuthEvent}`,
        timestamp: new Date()
      }]);
    }
  }, [lastAuthEvent]);

  // Test scenario handlers
  const testValidMagicLink = async () => {
    // Use a valid test token - in a real app this would be a JWT
    const result = await verifyMagicLink('valid_test_token');
    
    setResults(prev => [...prev, {
      title: 'Valid Magic Link Test',
      status: result.success ? 'success' : 'error',
      message: result.message,
      timestamp: new Date()
    }]);
    
    toast({
      title: result.success ? 'Magic Link Valid' : 'Magic Link Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };

  const testExpiredMagicLink = async () => {
    const result = await verifyMagicLink('test_expired_token');
    
    setResults(prev => [...prev, {
      title: 'Expired Magic Link Test',
      status: 'warning',
      message: result.message,
      timestamp: new Date()
    }]);
    
    toast({
      title: 'Expired Magic Link',
      description: result.message,
      variant: 'destructive',
    });
  };

  const testInvalidToken = async () => {
    const result = await verifyMagicLink('invalid!token@format');
    
    setResults(prev => [...prev, {
      title: 'Invalid Token Test',
      status: 'error',
      message: result.message,
      timestamp: new Date()
    }]);
    
    toast({
      title: 'Invalid Token',
      description: result.message,
      variant: 'destructive',
    });
  };

  const testNetworkFailure = async () => {
    const result = await verifyMagicLink('test_network_failure');
    
    setResults(prev => [...prev, {
      title: 'Network Failure Test',
      status: 'error',
      message: result.message,
      timestamp: new Date()
    }]);
    
    toast({
      title: 'Network Error',
      description: result.message,
      variant: 'destructive',
    });
  };

  const testCustomToken = async () => {
    if (!testToken) {
      toast({
        title: 'Token Required',
        description: 'Please enter a token to test',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await verifyMagicLink(testToken);
    
    setResults(prev => [...prev, {
      title: 'Custom Token Test',
      status: result.status === 'valid' ? 'success' : 'error',
      message: result.message,
      timestamp: new Date()
    }]);
    
    toast({
      title: 'Token Validation Result',
      description: result.message,
      variant: result.status === 'valid' ? 'default' : 'destructive',
    });
  };

  const openNewAuthWindow = () => {
    // Open a new tab/window with the login page
    window.open('/login', '_blank');
    
    setResults(prev => [...prev, {
      title: 'New Auth Window Opened',
      status: 'info',
      message: 'A new authentication window has been opened to test concurrent auth.',
      timestamp: new Date()
    }]);
  };

  const refreshAuthState = async () => {
    try {
      await refreshSession();
      
      setResults(prev => [...prev, {
        title: 'Auth State Refreshed',
        status: 'success',
        message: 'Authentication state successfully refreshed.',
        timestamp: new Date()
      }]);
      
      toast({
        title: 'Auth State Refreshed',
        description: 'Authentication state successfully refreshed.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh authentication state';
      
      setResults(prev => [...prev, {
        title: 'Auth Refresh Failed',
        status: 'error',
        message: errorMessage,
        timestamp: new Date()
      }]);
      
      toast({
        title: 'Auth Refresh Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const clearResults = () => {
    setResults([]);
    toast({
      title: 'Results Cleared',
      description: 'Test results have been cleared.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Testing Scenarios</CardTitle>
          <CardDescription>
            Test various authentication scenarios and edge cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <AlertTitle>{isOnline ? 'Online' : 'Offline'}</AlertTitle>
            <AlertDescription>
              {isOnline 
                ? 'Your network connection is active. All tests can run.'
                : 'You are currently offline. Network-dependent tests will fail.'}
            </AlertDescription>
          </Alert>

          <div>
            <p className="text-sm font-medium mb-2">Current Token Validation State:</p>
            <div className="flex items-center space-x-2 p-2 bg-muted rounded">
              {tokenValidationState === 'valid' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {tokenValidationState === 'expired' && (
                <XCircle className="h-5 w-5 text-amber-500" />
              )}
              {tokenValidationState === 'invalid' && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {tokenValidationState === 'unknown' && (
                <RefreshCw className="h-5 w-5 text-blue-500" />
              )}
              <span className="text-sm capitalize">{tokenValidationState}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button onClick={testValidMagicLink}>Test Valid Magic Link</Button>
            <Button onClick={testExpiredMagicLink} variant="destructive">Test Expired Magic Link</Button>
            <Button onClick={testInvalidToken} variant="destructive">Test Invalid Token</Button>
            <Button onClick={testNetworkFailure} variant="destructive">Simulate Network Failure</Button>
            <Button onClick={openNewAuthWindow}>Open New Auth Window</Button>
            <Button onClick={refreshAuthState} variant="outline">Refresh Auth State</Button>
          </div>

          <div className="pt-4">
            <div className="flex space-x-2">
              <Input 
                type="text"
                placeholder="Enter custom token to test"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
              />
              <Button onClick={testCustomToken}>Test</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Results of authentication test scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No test results yet. Run a test to see results here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="border rounded-md p-4 bg-card">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {result.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                      {result.status === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500" />}
                      {result.status === 'info' && <RefreshCw className="h-5 w-5 text-blue-500" />}
                      <h4 className="font-medium">{result.title}</h4>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{result.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={clearResults} variant="outline" className="ml-auto">
            Clear Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
