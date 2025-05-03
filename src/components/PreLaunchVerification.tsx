
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, CheckCircle, AlertCircle, Download } from "lucide-react";
import { verifyErrorBoundaries } from "@/utils/prelaunch/verifyErrorBoundaries";
import { verifyCacheInvalidation, forceCacheRefresh } from "@/utils/prelaunch/verifyCacheInvalidation";
import { verifyBackupRestore, createFullBackup, validateBackupIntegrity } from "@/utils/prelaunch/verifyBackupRestore";
import { verifyMonitoringAlerts, testAlertSystem } from "@/utils/prelaunch/verifyMonitoringAlerts";
import { verifyRouteRefresh, applyRouteRefreshFixes } from "@/utils/prelaunch/verifyRouteRefresh";
import { toast } from "@/hooks/use-toast";

interface VerificationState {
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  results: any[];
  issues: string[];
}

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
      setOverallProgress(20);
    } catch (error) {
      setErrorBoundaries({
        ...errorBoundaries,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
    
    // Verify cache invalidation
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
      setOverallProgress(40);
    } catch (error) {
      setCacheInvalidation({
        ...cacheInvalidation,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
    
    // Verify backup/restore
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
      setOverallProgress(60);
    } catch (error) {
      setBackupRestore({
        ...backupRestore,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
    
    // Verify monitoring alerts
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
      setOverallProgress(80);
    } catch (error) {
      setMonitoringAlerts({
        ...monitoringAlerts,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
    
    // Verify route refresh
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
      setOverallProgress(100);
    } catch (error) {
      setRouteRefresh({
        ...routeRefresh,
        status: "failed",
        progress: 100,
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
    }
    
    setVerificationInProgress(false);
    
    // Show toast with verification summary
    const totalIssues = 
      errorBoundaries.issues.length + 
      cacheInvalidation.issues.length + 
      backupRestore.issues.length + 
      monitoringAlerts.issues.length + 
      routeRefresh.issues.length;
    
    if (totalIssues === 0) {
      toast({
        title: "Pre-Launch Verification Complete",
        description: "All checks passed. The application is ready for launch!",
      });
    } else {
      toast({
        title: "Pre-Launch Verification Complete",
        description: `Found ${totalIssues} issue${totalIssues === 1 ? '' : 's'} that should be addressed before launch.`,
        variant: "destructive"
      });
    }
  };
  
  // Create a backup
  const handleCreateBackup = async () => {
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
  };
  
  // Force cache refresh
  const handleForceCacheRefresh = () => {
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
  };
  
  // Test monitoring alerts
  const handleTestAlerts = async () => {
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
  };
  
  // Apply fixes for route refresh issues
  const handleFixRouteRefreshIssues = async () => {
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
      setRouteRefresh({ ...routeRefresh, status: "running", progress: 20 });
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
      toast({
        title: "Fix Application Failed",
        description: error instanceof Error ? error.message : "Failed to apply fixes",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pre-Launch Verification</span>
          <div className="space-x-2">
            <Badge variant={getTotalIssuesCount() === 0 ? "success" : "destructive"}>
              {getTotalIssuesCount()} {getTotalIssuesCount() === 1 ? 'issue' : 'issues'}
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
          
          <TabsContent value="errorBoundaries" className="space-y-4">
            <VerificationCard 
              title="Error Boundaries" 
              description="Verify that error boundaries are properly implemented throughout the application"
              status={errorBoundaries.status}
              results={errorBoundaries.results}
              issues={errorBoundaries.issues}
            />
          </TabsContent>
          
          <TabsContent value="cacheInvalidation" className="space-y-4">
            <VerificationCard 
              title="Cache Invalidation" 
              description="Verify that cache invalidation strategies are properly configured"
              status={cacheInvalidation.status}
              results={cacheInvalidation.results}
              issues={cacheInvalidation.issues}
              actionButton={
                <Button size="sm" onClick={handleForceCacheRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Force Cache Refresh
                </Button>
              }
            />
          </TabsContent>
          
          <TabsContent value="backupRestore" className="space-y-4">
            <VerificationCard 
              title="Backup & Restore" 
              description="Verify that backup and restore procedures are working correctly"
              status={backupRestore.status}
              results={backupRestore.results}
              issues={backupRestore.issues}
              actionButton={
                <Button size="sm" onClick={handleCreateBackup}>
                  <Download className="h-4 w-4 mr-1" />
                  Create Backup
                </Button>
              }
            />
          </TabsContent>
          
          <TabsContent value="monitoringAlerts" className="space-y-4">
            <VerificationCard 
              title="Monitoring & Alerts" 
              description="Verify that monitoring and alert systems are properly configured"
              status={monitoringAlerts.status}
              results={monitoringAlerts.results}
              issues={monitoringAlerts.issues}
              actionButton={
                <Button size="sm" onClick={handleTestAlerts}>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Test Alerts
                </Button>
              }
            />
          </TabsContent>
          
          <TabsContent value="routeRefresh" className="space-y-4">
            <VerificationCard 
              title="Route Refresh" 
              description="Verify that forced refreshes work properly on each route"
              status={routeRefresh.status}
              results={routeRefresh.results}
              issues={routeRefresh.issues}
              actionButton={
                routeRefresh.issues.length > 0 ? (
                  <Button size="sm" onClick={handleFixRouteRefreshIssues}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Apply Fixes
                  </Button>
                ) : null
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div>
          {getTotalIssuesCount() === 0 ? (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="h-5 w-5 mr-1" />
              <span>All checks passed</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <AlertTriangle className="h-5 w-5 mr-1" />
              <span>{getTotalIssuesCount()} {getTotalIssuesCount() === 1 ? 'issue' : 'issues'} to resolve</span>
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
  
  // Helper function to count total issues
  function getTotalIssuesCount() {
    return (
      errorBoundaries.issues.length +
      cacheInvalidation.issues.length +
      backupRestore.issues.length +
      monitoringAlerts.issues.length +
      routeRefresh.issues.length
    );
  }
}

// Component to display verification results
function VerificationCard({
  title,
  description,
  status,
  results,
  issues,
  actionButton
}: {
  title: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  results: any[];
  issues: string[];
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <StatusBadge status={status} />
      </div>
      
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {status === "running" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Verifying...</span>
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      )}
      
      {status === "completed" && results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center">
                {!result.issues || result.issues.length === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                <span className="text-sm">
                  {result.component || result.cacheType || result.feature || result.system || result.route || ''}
                </span>
              </div>
              <Badge variant={(!result.issues || result.issues.length === 0) ? "success" : "destructive"}>
                {(!result.issues || result.issues.length === 0) ? 'Passed' : 'Issues'}
              </Badge>
            </div>
          ))}
        </div>
      )}
      
      {(status === "failed" || issues.length > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {issues.map((issue, index) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {actionButton && (
        <div className="flex justify-end">
          {actionButton}
        </div>
      )}
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: "pending" | "running" | "completed" | "failed" }) {
  if (status === "pending") {
    return (
      <Badge variant="outline">Pending</Badge>
    );
  }
  
  if (status === "running") {
    return (
      <Badge variant="outline" className="animate-pulse">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Running
      </Badge>
    );
  }
  
  if (status === "completed") {
    return (
      <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    );
  }
  
  if (status === "failed") {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  }
  
  return null;
}
