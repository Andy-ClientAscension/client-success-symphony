
import React, { createContext, useContext, useState, useCallback } from 'react';
import { VerificationState } from "@/components/prelaunch/types";
import { toast } from "@/hooks/use-toast";

interface PreLaunchContextType {
  errorBoundaries: VerificationState;
  cacheInvalidation: VerificationState;
  backupRestore: VerificationState;
  monitoringAlerts: VerificationState;
  routeRefresh: VerificationState;
  overallProgress: number;
  verificationInProgress: boolean;
  totalIssuesCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  runAllVerifications: () => Promise<void>;
  runSingleVerification: (type: VerificationType) => Promise<void>;
  resetAllVerifications: () => void;
  handleCreateBackup: () => Promise<void>;
  handleForceCacheRefresh: () => void;
  handleTestAlerts: () => Promise<void>;
  handleFixRouteRefreshIssues: () => Promise<void>;
}

type VerificationType = 'errorBoundaries' | 'cacheInvalidation' | 'backupRestore' | 'monitoringAlerts' | 'routeRefresh';

const initialVerificationState: VerificationState = {
  status: "pending",
  progress: 0,
  results: [],
  issues: []
};

const PreLaunchContext = createContext<PreLaunchContextType | undefined>(undefined);

export function usePreLaunchVerification() {
  const context = useContext(PreLaunchContext);
  if (!context) {
    throw new Error("usePreLaunchVerification must be used within a PreLaunchVerificationProvider");
  }
  return context;
}

export function PreLaunchVerificationProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("errorBoundaries");
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Import these functions here to avoid loading them on initial render
  const [verifyModules, setVerifyModules] = useState<any | null>(null);
  
  const loadVerifyModules = useCallback(async () => {
    if (!verifyModules) {
      // Dynamic import to defer loading until needed
      const { 
        verifyErrorBoundaries,
        verifyCacheInvalidation, forceCacheRefresh,
        verifyBackupRestore, createFullBackup,
        verifyMonitoringAlerts, testAlertSystem,
        verifyRouteRefresh, applyRouteRefreshFixes 
      } = await import('@/utils/prelaunch');
      
      setVerifyModules({
        verifyErrorBoundaries,
        verifyCacheInvalidation, forceCacheRefresh,
        verifyBackupRestore, createFullBackup,
        verifyMonitoringAlerts, testAlertSystem,
        verifyRouteRefresh, applyRouteRefreshFixes
      });
    }
    return verifyModules;
  }, [verifyModules]);

  // State for each verification category
  const [errorBoundaries, setErrorBoundaries] = useState<VerificationState>(initialVerificationState);
  const [cacheInvalidation, setCacheInvalidation] = useState<VerificationState>(initialVerificationState);
  const [backupRestore, setBackupRestore] = useState<VerificationState>(initialVerificationState);
  const [monitoringAlerts, setMonitoringAlerts] = useState<VerificationState>(initialVerificationState);
  const [routeRefresh, setRouteRefresh] = useState<VerificationState>(initialVerificationState);

  // Calculate total issues count
  const totalIssuesCount = errorBoundaries.issues.length +
    cacheInvalidation.issues.length +
    backupRestore.issues.length +
    monitoringAlerts.issues.length +
    routeRefresh.issues.length;
  
  // Individual verification functions
  const verifyErrorBoundariesAsync = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    setErrorBoundaries({ ...errorBoundaries, status: "running", progress: 20 });
    try {
      const errorResults = await modules.verifyErrorBoundaries();
      const errorIssues = errorResults
        .filter((r: any) => !r.implemented || r.issues.length > 0)
        .flatMap((r: any) => r.issues.length > 0 ? r.issues : [`${r.component} not implemented`]);
      
      setErrorBoundaries({
        status: errorIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: errorResults,
        issues: errorIssues
      });
    } catch (error) {
      setErrorBoundaries({
        status: "failed",
        progress: 100,
        results: [],
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  }, [errorBoundaries, loadVerifyModules]);
  
  const verifyCacheInvalidationAsync = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    setCacheInvalidation({ ...cacheInvalidation, status: "running", progress: 20 });
    try {
      const cacheResults = await modules.verifyCacheInvalidation();
      const cacheIssues = cacheResults
        .filter((r: any) => !r.isConfigured || r.issues.length > 0)
        .flatMap((r: any) => r.issues.length > 0 ? r.issues : [`${r.cacheType} not properly configured`]);
      
      setCacheInvalidation({
        status: cacheIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: cacheResults,
        issues: cacheIssues
      });
    } catch (error) {
      setCacheInvalidation({
        status: "failed",
        progress: 100,
        results: [],
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  }, [cacheInvalidation, loadVerifyModules]);
  
  const verifyBackupRestoreAsync = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    setBackupRestore({ ...backupRestore, status: "running", progress: 20 });
    try {
      const backupResults = await modules.verifyBackupRestore();
      const backupIssues = backupResults
        .filter((r: any) => !r.isConfigured || r.issues.length > 0)
        .flatMap((r: any) => r.issues.length > 0 ? r.issues : [`${r.feature} not properly configured`]);
      
      setBackupRestore({
        status: backupIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: backupResults,
        issues: backupIssues
      });
    } catch (error) {
      setBackupRestore({
        status: "failed",
        progress: 100,
        results: [],
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  }, [backupRestore, loadVerifyModules]);
  
  const verifyMonitoringAlertsAsync = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    setMonitoringAlerts({ ...monitoringAlerts, status: "running", progress: 20 });
    try {
      const alertResults = await modules.verifyMonitoringAlerts();
      const alertIssues = alertResults
        .filter((r: any) => !r.isConfigured || r.status === 'inactive' || r.status === 'error' || r.issues.length > 0)
        .flatMap((r: any) => r.issues.length > 0 ? r.issues : [`${r.system} not properly configured`]);
      
      setMonitoringAlerts({
        status: alertIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: alertResults,
        issues: alertIssues
      });
    } catch (error) {
      setMonitoringAlerts({
        status: "failed",
        progress: 100,
        results: [],
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  }, [monitoringAlerts, loadVerifyModules]);
  
  const verifyRouteRefreshAsync = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    setRouteRefresh({ ...routeRefresh, status: "running", progress: 20 });
    try {
      const routeResults = await modules.verifyRouteRefresh();
      const routeIssues = routeResults
        .filter((r: any) => !r.refreshWorking || !r.cacheCleared || !r.statePreserved || r.issues.length > 0)
        .flatMap((r: any) => r.issues.length > 0 ? r.issues : [`Route ${r.route} has refresh issues`]);
      
      setRouteRefresh({
        status: routeIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: routeResults,
        issues: routeIssues
      });
    } catch (error) {
      setRouteRefresh({
        status: "failed",
        progress: 100,
        results: [],
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  }, [routeRefresh, loadVerifyModules]);
  
  // Run all verifications
  const runAllVerifications = useCallback(async () => {
    await loadVerifyModules();
    setVerificationInProgress(true);
    setOverallProgress(0);
    
    // Reset all states
    setErrorBoundaries({ status: "pending", progress: 0, results: [], issues: [] });
    setCacheInvalidation({ status: "pending", progress: 0, results: [], issues: [] });
    setBackupRestore({ status: "pending", progress: 0, results: [], issues: [] });
    setMonitoringAlerts({ status: "pending", progress: 0, results: [], issues: [] });
    setRouteRefresh({ status: "pending", progress: 0, results: [], issues: [] });
    
    // Use Promise.all to run verifications concurrently
    await Promise.all([
      verifyErrorBoundariesAsync().then(() => setOverallProgress(prev => prev + 20)),
      verifyCacheInvalidationAsync().then(() => setOverallProgress(prev => prev + 20)),
      verifyBackupRestoreAsync().then(() => setOverallProgress(prev => prev + 20)),
      verifyMonitoringAlertsAsync().then(() => setOverallProgress(prev => prev + 20)),
      verifyRouteRefreshAsync().then(() => setOverallProgress(prev => prev + 20))
    ]);
    
    setVerificationInProgress(false);
    
    // Show toast with verification summary
    const updatedTotalIssues = 
      errorBoundaries.issues.length + 
      cacheInvalidation.issues.length + 
      backupRestore.issues.length + 
      monitoringAlerts.issues.length + 
      routeRefresh.issues.length;

    if (updatedTotalIssues === 0) {
      toast({
        title: "Pre-Launch Verification Complete",
        description: "All checks passed. The application is ready for launch!",
      });
    } else {
      toast({
        title: "Pre-Launch Verification Complete",
        description: `Found ${updatedTotalIssues} issue${updatedTotalIssues === 1 ? '' : 's'} that should be addressed before launch.`,
        variant: "destructive"
      });
    }
  }, [
    loadVerifyModules, 
    verifyErrorBoundariesAsync, 
    verifyCacheInvalidationAsync, 
    verifyBackupRestoreAsync, 
    verifyMonitoringAlertsAsync, 
    verifyRouteRefreshAsync,
    errorBoundaries.issues.length,
    cacheInvalidation.issues.length,
    backupRestore.issues.length,
    monitoringAlerts.issues.length,
    routeRefresh.issues.length
  ]);

  // Run a single verification
  const runSingleVerification = useCallback(async (type: VerificationType) => {
    switch (type) {
      case 'errorBoundaries':
        await verifyErrorBoundariesAsync();
        break;
      case 'cacheInvalidation':
        await verifyCacheInvalidationAsync();
        break;
      case 'backupRestore':
        await verifyBackupRestoreAsync();
        break;
      case 'monitoringAlerts':
        await verifyMonitoringAlertsAsync();
        break;
      case 'routeRefresh':
        await verifyRouteRefreshAsync();
        break;
    }
  }, [
    verifyErrorBoundariesAsync,
    verifyCacheInvalidationAsync,
    verifyBackupRestoreAsync,
    verifyMonitoringAlertsAsync,
    verifyRouteRefreshAsync
  ]);

  const resetAllVerifications = useCallback(() => {
    setErrorBoundaries(initialVerificationState);
    setCacheInvalidation(initialVerificationState);
    setBackupRestore(initialVerificationState);
    setMonitoringAlerts(initialVerificationState);
    setRouteRefresh(initialVerificationState);
    setOverallProgress(0);
  }, []);
  
  // Action handlers
  const handleCreateBackup = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    try {
      const backup = await modules.createFullBackup();
      
      // Create a downloadable file
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Created",
        description: "Application backup has been created and downloaded",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : "Failed to create backup",
        variant: "destructive"
      });
    }
  }, [loadVerifyModules]);
  
  const handleForceCacheRefresh = useCallback(() => {
    loadVerifyModules().then(modules => {
      if (!modules) return;

      try {
        modules.forceCacheRefresh();
        toast({
          title: "Cache Refreshed",
          description: "Application cache has been cleared and will be refreshed",
        });
      } catch (error) {
        toast({
          title: "Cache Refresh Failed",
          description: error instanceof Error ? error.message : "Failed to refresh cache",
          variant: "destructive"
        });
      }
    });
  }, [loadVerifyModules]);
  
  const handleTestAlerts = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    try {
      await modules.testAlertSystem("error");
      toast({
        title: "Alert Test Sent",
        description: "A test alert has been sent to the monitoring system",
      });
    } catch (error) {
      toast({
        title: "Alert Test Failed",
        description: error instanceof Error ? error.message : "Failed to send test alert",
        variant: "destructive"
      });
    }
  }, [loadVerifyModules]);
  
  const handleFixRouteRefreshIssues = useCallback(async () => {
    const modules = await loadVerifyModules();
    if (!modules) return;

    try {
      // Find routes with issues
      const routesWithIssues = (routeRefresh.results as any[])
        .filter(r => r.issues.length > 0)
        .map(r => r.route);
      
      // Apply fixes
      await Promise.all(routesWithIssues.map(route => modules.applyRouteRefreshFixes(route)));
      
      toast({
        title: "Route Refresh Fixes Applied",
        description: `Applied fixes for ${routesWithIssues.length} route${routesWithIssues.length === 1 ? '' : 's'}`,
      });
      
      // Re-run route refresh verification
      await verifyRouteRefreshAsync();
    } catch (error) {
      toast({
        title: "Fix Application Failed",
        description: error instanceof Error ? error.message : "Failed to apply fixes",
        variant: "destructive"
      });
    }
  }, [routeRefresh.results, loadVerifyModules, verifyRouteRefreshAsync]);

  const contextValue = {
    errorBoundaries,
    cacheInvalidation,
    backupRestore,
    monitoringAlerts,
    routeRefresh,
    overallProgress,
    verificationInProgress,
    totalIssuesCount,
    activeTab,
    setActiveTab,
    runAllVerifications,
    runSingleVerification,
    resetAllVerifications,
    handleCreateBackup,
    handleForceCacheRefresh,
    handleTestAlerts,
    handleFixRouteRefreshIssues
  };

  return (
    <PreLaunchContext.Provider value={contextValue}>
      {children}
    </PreLaunchContext.Provider>
  );
}
