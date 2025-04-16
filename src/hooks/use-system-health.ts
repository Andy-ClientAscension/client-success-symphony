
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getAllClients } from '@/lib/data';

export interface SystemHealthCheck {
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export function useSystemHealth(intervalMs = 300000) { // 5 minutes
  const [healthChecks, setHealthChecks] = useState<SystemHealthCheck[]>([]);
  const { toast } = useToast();

  const runSystemHealthCheck = () => {
    const clients = getAllClients();
    const checks: SystemHealthCheck[] = [];

    // Data Integrity Checks
    if (clients.length === 0) {
      checks.push({
        type: 'warning',
        message: 'No clients found in the system',
        severity: 'medium'
      });
    }

    // Performance Checks
    const incompleteClients = clients.filter(client => 
      client.progress < 50 || !client.status
    );

    if (incompleteClients.length > 5) {
      checks.push({
        type: 'warning',
        message: `${incompleteClients.length} clients have incomplete profiles`,
        severity: 'high'
      });
    }

    // Churn Risk Analysis
    const potentialChurnClients = clients.filter(client => 
      client.npsScore !== undefined && client.npsScore < 6
    );
    
    if (potentialChurnClients.length > 0) {
      checks.push({
        type: 'warning',
        message: `${potentialChurnClients.length} clients have low NPS scores and may be at risk of churning`,
        severity: 'high'
      });
    }

    // Performance Trend Check
    const lowPerformingClients = clients.filter(client => 
      client.dealsClosed !== undefined && client.callsBooked !== undefined && 
      client.dealsClosed === 0 && client.callsBooked > 3
    );
    
    if (lowPerformingClients.length > 0) {
      checks.push({
        type: 'warning',
        message: `${lowPerformingClients.length} clients have calls booked but no deals closed`,
        severity: 'medium'
      });
    }

    setHealthChecks(checks);

    // Trigger toasts for high-severity issues
    checks.forEach(check => {
      if (check.severity === 'high') {
        toast({
          title: 'System Health Alert',
          description: check.message,
          variant: 'destructive'
        });
      }
    });
  };

  useEffect(() => {
    // Initial check
    runSystemHealthCheck();

    // Periodic checks
    const interval = setInterval(runSystemHealthCheck, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return { healthChecks, runSystemHealthCheck };
}
