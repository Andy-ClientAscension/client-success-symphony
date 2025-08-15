import React, { useState } from 'react';
import { Bell, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ContractNotificationsTrigger() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [results, setResults] = useState<{
    notificationsCreated: number;
    clientsChecked: number;
  } | null>(null);

  const runContractCheck = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-contract-expiry', {
        body: {}
      });

      if (error) throw error;

      setResults(data);
      setLastRun(new Date());
      
      toast({
        title: "Contract Check Complete",
        description: `Created ${data.notificationsCreated} new notifications from ${data.clientsChecked} clients`,
      });

    } catch (error) {
      console.error('Error running contract check:', error);
      toast({
        title: "Error",
        description: "Failed to run contract expiry check",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Contract Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Automatically checks contracts approaching expiry dates
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Notifications: 80d, 45d, 30d, 2w, 1w, 5d, 3d, 2d, 24h, expired
            </p>
          </div>
          <Button 
            onClick={runContractCheck} 
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                Checking...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Check
              </>
            )}
          </Button>
        </div>

        {lastRun && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last run:</span>
              <span>{lastRun.toLocaleString()}</span>
            </div>
            
            {results && (
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {results.clientsChecked} clients checked
                </Badge>
                <Badge variant={results.notificationsCreated > 0 ? "destructive" : "default"} className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {results.notificationsCreated} notifications created
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <strong>Note:</strong> In production, this would run automatically daily via a cron job. 
          Use this manual trigger for testing and immediate checks.
        </div>
      </CardContent>
    </Card>
  );
}