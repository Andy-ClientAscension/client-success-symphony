
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { verifyErrorBoundaries } from "@/utils/prelaunch/verifyErrorBoundaries";
import { verifyCacheInvalidation, forceCacheRefresh } from "@/utils/prelaunch/verifyCacheInvalidation";
import { verifyBackupRestore, createFullBackup } from "@/utils/prelaunch/verifyBackupRestore";
import { verifyMonitoringAlerts, testAlertSystem } from "@/utils/prelaunch/verifyMonitoringAlerts";
import { verifyRouteRefresh, applyRouteRefreshFixes, RouteRefreshResult } from "@/utils/prelaunch/verifyRouteRefresh";
import { toast } from "@/hooks/use-toast";
import { VerificationState } from "./prelaunch/types";
import { ErrorBoundariesTab } from "./prelaunch/ErrorBoundariesTab";
import { CacheInvalidationTab } from "./prelaunch/CacheInvalidationTab";
import { BackupRestoreTab } from "./prelaunch/BackupRestoreTab";
import { MonitoringAlertsTab } from "./prelaunch/MonitoringAlertsTab";
import { RouteRefreshTab } from "./prelaunch/RouteRefreshTab";

export function PreLaunchVerification() {
  const [activeTab, setActiveTab] = useState("errorBoundaries");
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  
  // State for each verification category
  const [errorBoundaries, setErrorBoundaries] = useState<VerificationState>({
    status: "pending",
    progress: 0,
    results: [],
    issues: []
  });
  
  const [cacheInvalidation, setCacheInvalidation] = useState<VerificationState>({
    status: "pending",
    progress: 0,
    results: [],
    issues: []
  });
  
  const [backupRestore, setBackupRestore] = useState<VerificationState>({
    status: "pending",
    progress: 0,
    results: [],
    issues: []
  });
  
  const [monitoringAlerts, setMonitoringAlerts] = useState<VerificationState>({
    status: "pending",
    progress: 0,
    results: [],
    issues: []
  });
  
  const [routeRefresh, setRouteRefresh] = useState<VerificationState>({
    status: "pending",
    progress: 0,
    results: [],
    issues: []
  });
  
  // Calculate total issues count
  const totalIssuesCount = useMemo(() => {
    return (
      errorBoundaries.issues.length +
      cacheInvalidation.issues.length +
      backupRestore.issues.length +
      monitoringAlerts.issues.length +
      routeRefresh.issues.length
    );
  }, [
    errorBoundaries.issues.length,
    cacheInvalidation.issues.length,
    backupRestore.issues.length,
    monitoringAlerts.issues.length,
    routeRefresh.issues.length
  ]);
  
  // Run all verifications
  const runAllVerifications = async () => {
    setVerificationInProgress(true);
    setOverallProgress(0);
    
    // Reset all states
    setErrorBoundaries({ status: "pending", progress: 0, results: [], issues: [] });
    setCacheInvalidation({ status: "pending", progress: 0, results: [], issues: [] });
    setBackupRestore({ status: "pending", progress: 0, results: [], issues: [] });
    setMonitoringAlerts({ status: "pending", progress: 0, results: [], issues: [] });
    setRouteRefresh({ status: "pending", progress: 0, results: [], issues: [] });
    
    // Verify error boundaries
    await verifyErrorBoundariesAsync();
    setOverallProgress(20);
    
    // Verify cache invalidation
    await verifyCacheInvalidationAsync();
    setOverallProgress(40);
    
    // Verify backup/restore
    await verifyBackupRestoreAsync();
    setOverallProgress(60);
    
    // Verify monitoring alerts
    await verifyMonitoringAlertsAsync();
    setOverallProgress(80);
    
    // Verify route refresh
    await verifyRouteRefreshAsync();
    setOverallProgress(100);
    
    setVerificationInProgress(false);
    
    // Show toast with verification summary
    if (totalIssuesCount === 0) {
      toast({
        title: "Pre-Launch Verification Complete",
        description: "All checks passed. The application is ready for launch!",
      });
    } else {
      toast({
        title: "Pre-Launch Verification Complete",
        description: `Found ${totalIssuesCount} issue${totalIssuesCount === 1 ? '' : 's'} that should be addressed before launch.`,
        variant: "destructive"
      });
    }
  };
  
  // Individual verification functions
  const verifyErrorBoundariesAsync = async () => {
    setErrorBoundaries({ ...errorBoundaries, status: "running", progress: 20 });
    try {
      const errorResults = await verifyErrorBoundaries();
      const errorIssues = errorResults
        .filter(r => !r.implemented || r.issues.length > 0)
        .flatMap(r => r.issues.length > 0 ? r.issues : [`${r.component} not implemented`]);
      
      setErrorBoundaries({
        status: errorIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: errorResults,
        issues: errorIssues
      });
    } catch (error) {
      setErrorBoundaries({
        ...errorBoundaries,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  };
  
  const verifyCacheInvalidationAsync = async () => {
    setCacheInvalidation({ ...cacheInvalidation, status: "running", progress: 20 });
    try {
      const cacheResults = await verifyCacheInvalidation();
      const cacheIssues = cacheResults
        .filter(r => !r.isConfigured || r.issues.length > 0)
        .flatMap(r => r.issues.length > 0 ? r.issues : [`${r.cacheType} not properly configured`]);
      
      setCacheInvalidation({
        status: cacheIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: cacheResults,
        issues: cacheIssues
      });
    } catch (error) {
      setCacheInvalidation({
        ...cacheInvalidation,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  };
  
  const verifyBackupRestoreAsync = async () => {
    setBackupRestore({ ...backupRestore, status: "running", progress: 20 });
    try {
      const backupResults = await verifyBackupRestore();
      const backupIssues = backupResults
        .filter(r => !r.isConfigured || r.issues.length > 0)
        .flatMap(r => r.issues.length > 0 ? r.issues : [`${r.feature} not properly configured`]);
      
      setBackupRestore({
        status: backupIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: backupResults,
        issues: backupIssues
      });
    } catch (error) {
      setBackupRestore({
        ...backupRestore,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  };
  
  const verifyMonitoringAlertsAsync = async () => {
    setMonitoringAlerts({ ...monitoringAlerts, status: "running", progress: 20 });
    try {
      const alertResults = await verifyMonitoringAlerts();
      const alertIssues = alertResults
        .filter(r => !r.isConfigured || r.status === 'inactive' || r.status === 'error' || r.issues.length > 0)
        .flatMap(r => r.issues.length > 0 ? r.issues : [`${r.system} not properly configured`]);
      
      setMonitoringAlerts({
        status: alertIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: alertResults,
        issues: alertIssues
      });
    } catch (error) {
      setMonitoringAlerts({
        ...monitoringAlerts,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  };
  
  const verifyRouteRefreshAsync = async () => {
    setRouteRefresh({ ...routeRefresh, status: "running", progress: 20 });
    try {
      const routeResults = await verifyRouteRefresh();
      const routeIssues = routeResults
        .filter(r => !r.refreshWorking || !r.cacheCleared || !r.statePreserved || r.issues.length > 0)
        .flatMap(r => r.issues.length > 0 ? r.issues : [`Route ${r.route} has refresh issues`]);
      
      setRouteRefresh({
        status: routeIssues.length > 0 ? "failed" : "completed",
        progress: 100,
        results: routeResults,
        issues: routeIssues
      });
    } catch (error) {
      setRouteRefresh({
        ...routeRefresh,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
  };
  
  // Action handlers
  const handleCreateBackup = useCallback(async () => {
    try {
      const backup = await createFullBackup();
      
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
  }, []);
  
  const handleForceCacheRefresh = useCallback(() => {
    try {
      forceCacheRefresh();
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
  }, []);
  
  const handleTestAlerts = useCallback(async () => {
    try {
      await testAlertSystem("error");
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
  }, []);
  
  const handleFixRouteRefreshIssues = useCallback(async () => {
    try {
      // Find routes with issues
      const routesWithIssues = (routeRefresh.results as RouteRefreshResult[])
        .filter(r => r.issues.length > 0)
        .map(r => r.route);
      
      // Apply fixes
      await Promise.all(routesWithIssues.map(route => applyRouteRefreshFixes(route)));
      
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
  }, [routeRefresh.results]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pre-Launch Verification</span>
          <div className="space-x-2">
            <Badge variant={totalIssuesCount === 0 ? "success" : "destructive"}>
              {totalIssuesCount} {totalIssuesCount === 1 ? 'issue' : 'issues'}
            </Badge>
            <Badge variant="outline" className="font-mono">v1.0</Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Complete all verification checks before launching your application
        </CardDescription>
        
        {overallProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Verification Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="errorBoundaries" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
            <TabsTrigger value="errorBoundaries" disabled={verificationInProgress} className="relative">
              Error Boundaries
              {errorBoundaries.issues.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {errorBoundaries.issues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cacheInvalidation" disabled={verificationInProgress} className="relative">
              Caching
              {cacheInvalidation.issues.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {cacheInvalidation.issues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="backupRestore" disabled={verificationInProgress} className="relative">
              Backup/Restore
              {backupRestore.issues.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {backupRestore.issues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="monitoringAlerts" disabled={verificationInProgress} className="relative">
              Monitoring
              {monitoringAlerts.issues.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {monitoringAlerts.issues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="routeRefresh" disabled={verificationInProgress} className="relative">
              Route Refresh
              {routeRefresh.issues.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {routeRefresh.issues.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="errorBoundaries">
            <ErrorBoundariesTab state={errorBoundaries} />
          </TabsContent>
          
          <TabsContent value="cacheInvalidation">
            <CacheInvalidationTab state={cacheInvalidation} onActionClick={handleForceCacheRefresh} />
          </TabsContent>
          
          <TabsContent value="backupRestore">
            <BackupRestoreTab state={backupRestore} onActionClick={handleCreateBackup} />
          </TabsContent>
          
          <TabsContent value="monitoringAlerts">
            <MonitoringAlertsTab state={monitoringAlerts} onActionClick={handleTestAlerts} />
          </TabsContent>
          
          <TabsContent value="routeRefresh">
            <RouteRefreshTab state={routeRefresh} onActionClick={handleFixRouteRefreshIssues} />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div>
          {totalIssuesCount === 0 ? (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="h-5 w-5 mr-1" />
              <span>All checks passed</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <AlertTriangle className="h-5 w-5 mr-1" />
              <span>{totalIssuesCount} {totalIssuesCount === 1 ? 'issue' : 'issues'} to resolve</span>
            </div>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={verificationInProgress}
          >
            View Report
          </Button>
          <Button 
            onClick={runAllVerifications}
            disabled={verificationInProgress}
          >
            {verificationInProgress ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>Run Verification</>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
