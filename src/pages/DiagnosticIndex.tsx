
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, diagnoseAuthIssue, checkNetworkConnectivity } from '@/integrations/supabase/client';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function DiagnosticIndex() {
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<{ online: boolean; latency?: number; status?: string }>({
    online: navigator.onLine,
  });
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  useEffect(() => {
    runNetworkCheck();
  }, []);

  const runNetworkCheck = async () => {
    try {
      const status = await checkNetworkConnectivity();
      setNetworkStatus({
        online: status.online,
        latency: status.latency,
        status: status.status ? String(status.status) : undefined,
      });
    } catch (error) {
      console.error('Error checking network:', error);
      setNetworkStatus({ online: navigator.onLine, status: 'error' });
    }
  };

  const runFullDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      // Check network connectivity
      const connectivity = await checkNetworkConnectivity();

      // Check auth status if network is available
      let authDiag = null;
      if (connectivity.online) {
        try {
          authDiag = await diagnoseAuthIssue();
        } catch (e) {
          console.error('Error diagnosing auth:', e);
          authDiag = { error: 'Failed to check auth service' };
        }
      }

      // Direct API test
      let directApiTest = null;
      if (connectivity.online) {
        try {
          // Test the Supabase API directly
          const response = await fetch('https://bajfdvphpoopkmpgzyeo.supabase.co/auth/v1/token?grant_type=none', {
            method: 'GET',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhamZkdnBocG9vcGttcGd6eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM5NTYsImV4cCI6MjA2MDI4OTk1Nn0.QJ7M2iBALcCy_bvJXAIbwFZ8JDh0G3O-t_IgBfDTikE',
              'Content-Type': 'application/json'
            }
          });
          directApiTest = {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          };
        } catch (e) {
          console.error('Direct API test error:', e);
          directApiTest = { error: e instanceof Error ? e.message : String(e) };
        }
      }

      const results = {
        timestamp: new Date().toISOString(),
        network: connectivity,
        auth: authDiag,
        directApiTest,
        userAgent: navigator.userAgent,
        url: window.location.href,
        corsTest: {
          origin: window.location.origin,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          }
        },
        browserNetworkStatus: navigator.onLine
      };

      setDiagnosticResults(results);
      console.log('Diagnostic results:', results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDiagnosticResults({
        error: error instanceof Error ? error.message : 'Unknown error during diagnostics',
        timestamp: new Date().toISOString(),
        browserNetworkStatus: navigator.onLine
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Authentication Diagnostic Tool</h1>
        <p className="text-gray-600">
          This tool helps troubleshoot authentication and connectivity issues with the Supabase backend.
        </p>

        {/* Network status indicator */}
        {networkStatus && (
          <Alert variant={networkStatus.online ? "default" : "destructive"} className="mb-4">
            {networkStatus.online ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <AlertDescription className="flex justify-between items-center">
              <span>
                {networkStatus.online
                  ? `Online (Latency: ${networkStatus.latency || '?'}ms)`
                  : 'You appear to be offline. Please check your internet connection.'}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={runNetworkCheck}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Check Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Authentication System Diagnostic</CardTitle>
            <CardDescription>
              Run a comprehensive check of your application's connection to the authentication service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagnosticResults && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border overflow-auto max-h-96">
                <h3 className="font-medium mb-2">Diagnostic Results:</h3>
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(diagnosticResults, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={runFullDiagnostic} 
              disabled={isRunningDiagnostic}
            >
              {isRunningDiagnostic ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                'Run Authentication Diagnostic'
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual API Test</CardTitle>
            <CardDescription>
              Information about testing the Supabase API directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>To test authentication directly with the Supabase API:</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                <pre className="text-xs whitespace-pre-wrap">
{`POST https://bajfdvphpoopkmpgzyeo.supabase.co/auth/v1/token?grant_type=password
Headers: {
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhamZkdnBocG9vcGttcGd6eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM5NTYsImV4cCI6MjA2MDI4OTk1Nn0.QJ7M2iBALcCy_bvJXAIbwFZ8JDh0G3O-t_IgBfDTikE",
  "Content-Type": "application/json"
}
Body: {
  "email": "your-email@example.com",
  "password": "your-password"
}`}
                </pre>
              </div>
              <p>Note: In most cases, you should use the Supabase client's login function instead of direct API calls.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
