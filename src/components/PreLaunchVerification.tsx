
import React, { lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorBoundariesTab } from "./prelaunch/ErrorBoundariesTab";
import { CacheInvalidationTab } from "./prelaunch/CacheInvalidationTab";
import { BackupRestoreTab } from "./prelaunch/BackupRestoreTab";
import { MonitoringAlertsTab } from "./prelaunch/MonitoringAlertsTab";
import { RouteRefreshTab } from "./prelaunch/RouteRefreshTab";
import { PreLaunchVerificationProvider, usePreLaunchVerification } from "@/contexts/PreLaunchVerificationContext";

// Lazy load the tab contents to reduce initial load time
const LazyTabContent = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="py-4"><Spinner size="md" /></div>}>
    {children}
  </Suspense>
);

function PreLaunchVerificationContent() {
  const { 
    errorBoundaries, 
    cacheInvalidation, 
    backupRestore, 
    monitoringAlerts, 
    routeRefresh,
    overallProgress, 
    totalIssuesCount, 
    verificationInProgress,
    activeTab,
    setActiveTab,
    runAllVerifications,
    handleCreateBackup,
    handleForceCacheRefresh,
    handleTestAlerts,
    handleFixRouteRefreshIssues
  } = usePreLaunchVerification();

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <LazyTabContent>
              <ErrorBoundariesTab state={errorBoundaries} />
            </LazyTabContent>
          </TabsContent>
          
          <TabsContent value="cacheInvalidation">
            <LazyTabContent>
              <CacheInvalidationTab state={cacheInvalidation} onActionClick={handleForceCacheRefresh} />
            </LazyTabContent>
          </TabsContent>
          
          <TabsContent value="backupRestore">
            <LazyTabContent>
              <BackupRestoreTab state={backupRestore} onActionClick={handleCreateBackup} />
            </LazyTabContent>
          </TabsContent>
          
          <TabsContent value="monitoringAlerts">
            <LazyTabContent>
              <MonitoringAlertsTab state={monitoringAlerts} onActionClick={handleTestAlerts} />
            </LazyTabContent>
          </TabsContent>
          
          <TabsContent value="routeRefresh">
            <LazyTabContent>
              <RouteRefreshTab state={routeRefresh} onActionClick={handleFixRouteRefreshIssues} />
            </LazyTabContent>
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

export function PreLaunchVerification() {
  return (
    <PreLaunchVerificationProvider>
      <PreLaunchVerificationContent />
    </PreLaunchVerificationProvider>
  );
}
