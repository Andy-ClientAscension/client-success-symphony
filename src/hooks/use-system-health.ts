
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getAllClients } from '@/lib/data';
import { validateClients } from '@/utils/clientValidation';

export interface SystemHealthCheck {
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high';
  id?: string; // Add unique ID for tracking
}

export function useSystemHealth(intervalMs = 300000) { // 5 minutes
  const [healthChecks, setHealthChecks] = useState<SystemHealthCheck[]>([]);
  const { toast } = useToast();
  const initialCheckDone = useRef(false);
  const lastNotificationTime = useRef<Record<string, number>>({});

  const runSystemHealthCheck = () => {
    // Get clients and validate them
    const allClients = getAllClients();
    const clients = validateClients(allClients);
    const checks: SystemHealthCheck[] = [];

    // Data Integrity Checks
    if (clients.length === 0) {
      checks.push({
        type: 'warning',
        message: 'No clients found in the system',
        severity: 'medium',
        id: 'no-clients'
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
        severity: 'high',
        id: 'incomplete-profiles'
      });
    }

    // Churn Risk Analysis
    const potentialChurnClients = clients.filter(client => 
      client.npsScore !== undefined && client.npsScore !== null && client.npsScore < 6
    );
    
    if (potentialChurnClients.length > 0) {
      checks.push({
        type: 'warning',
        message: `${potentialChurnClients.length} clients have low NPS scores and may be at risk of churning`,
        severity: 'high',
        id: 'churn-risk'
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
        severity: 'medium',
        id: 'low-performance'
      });
    }

    // Data Validation Checks
    const dataIssues = allClients.length - clients.length;
    if (dataIssues > 0) {
      checks.push({
        type: 'error',
        message: `${dataIssues} clients have data integrity issues and may need repair`,
        severity: 'high',
        id: 'data-integrity'
      });
    }

    setHealthChecks(checks);

    // Only show toast notifications on first load if it's been more than 24 hours since last notification
    // or if this isn't the initial check
    const now = Date.now();
    
    checks.forEach(check => {
      if (check.severity === 'high') {
        const lastNotified = lastNotificationTime.current[check.id || check.message] || 0;
        const hoursSinceLastNotification = (now - lastNotified) / (1000 * 60 * 60);
        
        // Show notification if:
        // 1. This is not the initial check, OR
        // 2. It's been more than 24 hours since we last notified about this issue
        if (!initialCheckDone.current || hoursSinceLastNotification > 24) {
          toast({
            title: 'System Health Alert',
            description: check.message,
            variant: 'destructive'
          });
          
          // Update last notification time
          lastNotificationTime.current[check.id || check.message] = now;
        }
      }
    });
    
    // Mark initial check as done
    initialCheckDone.current = true;
  };

  useEffect(() => {
    // Initial check with a small delay to prevent immediate alerts on dashboard load
    const initialTimer = setTimeout(() => {
      runSystemHealthCheck();
    }, 5000); // 5 second delay for initial check

    // Periodic checks
    const interval = setInterval(runSystemHealthCheck, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [intervalMs]);

  return { healthChecks, runSystemHealthCheck };
}
