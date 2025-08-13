import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AuditIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'database' | 'component' | 'navigation' | 'functionality' | 'performance' | 'security';
  title: string;
  description: string;
  page?: string;
  component?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixed?: boolean;
}

interface SystemAuditContextType {
  issues: AuditIssue[];
  isAuditing: boolean;
  runFullAudit: () => Promise<void>;
  markIssueFixed: (issueId: string) => void;
  getIssuesByCategory: (category: string) => AuditIssue[];
  getCriticalIssues: () => AuditIssue[];
}

const SystemAuditContext = createContext<SystemAuditContextType | undefined>(undefined);

export function SystemAuditProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const runFullAudit = async () => {
    setIsAuditing(true);
    const foundIssues: AuditIssue[] = [];

    try {
      // Database audit
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .limit(1);

      if (clientsError || !clients || clients.length === 0) {
        foundIssues.push({
          id: 'db-clients-empty',
          type: 'warning',
          category: 'database',
          title: 'No Client Data',
          description: 'Clients table exists but contains no data. Users will see empty lists.',
          severity: 'medium'
        });
      }

      // Navigation audit
      const currentPath = window.location.pathname;
      if (currentPath === '/health-score') {
        foundIssues.push({
          id: 'nav-health-score-mismatch',
          type: 'error',
          category: 'navigation',
          title: 'Navigation Route Mismatch',
          description: 'Health Score sidebar link points to /health-score but route is /health-score-dashboard',
          severity: 'high'
        });
      }

      // Component functionality audit
      const buttons = document.querySelectorAll('button');
      let nonFunctionalButtons = 0;
      buttons.forEach((button, index) => {
        if (!button.onclick && !button.getAttribute('onClick') && !button.closest('form')) {
          nonFunctionalButtons++;
        }
      });

      if (nonFunctionalButtons > 5) {
        foundIssues.push({
          id: 'ui-non-functional-buttons',
          type: 'warning',
          category: 'functionality',
          title: 'Non-functional Buttons',
          description: `Found ${nonFunctionalButtons} buttons without click handlers`,
          severity: 'medium'
        });
      }

      // Performance audit
      const performanceEntries = performance.getEntriesByType('navigation');
      if (performanceEntries.length > 0) {
        const navEntry = performanceEntries[0] as PerformanceNavigationTiming;
        const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
        
        if (loadTime > 3000) {
          foundIssues.push({
            id: 'perf-slow-load',
            type: 'warning',
            category: 'performance',
            title: 'Slow Page Load',
            description: `Page load time: ${loadTime.toFixed(0)}ms (>3s is poor)`,
            severity: 'medium'
          });
        }
      }

      // Error boundary coverage audit
      const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
      if (errorBoundaries.length === 0) {
        foundIssues.push({
          id: 'comp-no-error-boundaries',
          type: 'warning',
          category: 'component',
          title: 'Missing Error Boundaries',
          description: 'No error boundaries detected. Add error boundary coverage to prevent crashes.',
          severity: 'high'
        });
      }

      setIssues(foundIssues);
    } catch (error) {
      console.error('Audit failed:', error);
      foundIssues.push({
        id: 'audit-system-error',
        type: 'error',
        category: 'component',
        title: 'Audit System Error',
        description: 'Failed to complete system audit',
        severity: 'critical'
      });
      setIssues(foundIssues);
    } finally {
      setIsAuditing(false);
    }
  };

  const markIssueFixed = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, fixed: true } : issue
    ));
  };

  const getIssuesByCategory = (category: string) => {
    return issues.filter(issue => issue.category === category && !issue.fixed);
  };

  const getCriticalIssues = () => {
    return issues.filter(issue => issue.severity === 'critical' && !issue.fixed);
  };

  useEffect(() => {
    // Run initial audit after component mount
    const timer = setTimeout(() => {
      runFullAudit();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SystemAuditContext.Provider value={{
      issues,
      isAuditing,
      runFullAudit,
      markIssueFixed,
      getIssuesByCategory,
      getCriticalIssues
    }}>
      {children}
    </SystemAuditContext.Provider>
  );
}

export function useSystemAudit() {
  const context = useContext(SystemAuditContext);
  if (context === undefined) {
    throw new Error('useSystemAudit must be used within a SystemAuditProvider');
  }
  return context;
}