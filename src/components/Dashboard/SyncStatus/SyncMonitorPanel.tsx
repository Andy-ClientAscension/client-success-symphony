
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAutoSync } from '@/hooks/useAutoSync';
import { autoSyncEngine, SyncEvent } from '@/utils/autoSync/autoSyncEngine';
import { formatDistanceToNow, format } from 'date-fns';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp, Settings, BarChart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SyncMonitorPanel() {
  const { isSyncing, lastSync, metrics, triggerSync, configureSync } = useAutoSync();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncHistory, setSyncHistory] = useState<SyncEvent[]>([]);

  // Get full sync history from the engine
  useEffect(() => {
    const engineMetrics = autoSyncEngine.getMetrics();
    setSyncHistory(engineMetrics.syncHistory || []);
    
    // Poll for updates
    const interval = setInterval(() => {
      const updatedMetrics = autoSyncEngine.getMetrics();
      setSyncHistory(updatedMetrics.syncHistory || []);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border border-border/30 shadow-sm transition-all duration-300">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Data Synchronization Monitor
            <Badge variant={isSyncing ? "default" : "outline"} className="ml-2">
              {isSyncing ? "Active" : "Idle"}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Monitor and control real-time data synchronization across dashboard components
        </CardDescription>
      </CardHeader>
      
      {expanded && (
        <>
          <div className="p-4 pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Sync Status</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="text-2xl font-bold">{isSyncing ? "Syncing..." : "Ready"}</div>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {lastSync ? formatDistanceToNow(lastSync, { addSuffix: true }) : "Never"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="text-2xl font-bold">
                        {metrics.totalSuccessfulSyncs > 0 
                          ? Math.round((metrics.totalSuccessfulSyncs / (metrics.totalSuccessfulSyncs + metrics.totalFailedSyncs)) * 100)
                          : 0}%
                      </div>
                      <Progress 
                        value={metrics.totalSuccessfulSyncs > 0 
                          ? Math.round((metrics.totalSuccessfulSyncs / (metrics.totalSuccessfulSyncs + metrics.totalFailedSyncs)) * 100)
                          : 0} 
                        className="h-2 mt-2"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="text-2xl font-bold">
                        {metrics.averageSyncTime ? `${Math.round(metrics.averageSyncTime)}ms` : "N/A"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Average sync time
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Sync Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="text-muted-foreground">Total Syncs:</dt>
                        <dd>{metrics.totalSuccessfulSyncs + metrics.totalFailedSyncs}</dd>
                        
                        <dt className="text-muted-foreground">Successful:</dt>
                        <dd className="text-green-600">{metrics.totalSuccessfulSyncs}</dd>
                        
                        <dt className="text-muted-foreground">Failed:</dt>
                        <dd className="text-red-600">{metrics.totalFailedSyncs}</dd>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4 max-h-[120px] overflow-auto">
                      {syncHistory.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {syncHistory.slice(-3).reverse().map((event, i) => (
                            <li key={i} className="flex items-center gap-2">
                              {event.type === 'success' || event.type === 'auto' || event.type === 'manual' ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
                              )}
                              <span>{format(new Date(event.timestamp), 'HH:mm:ss')}</span>
                              <span className="text-muted-foreground">{event.type}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No sync history available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 gap-2 bg-muted/50 p-2 text-sm font-medium">
                    <div className="col-span-2">Time</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-4">Resources</div>
                  </div>
                  
                  <div className="max-h-[240px] overflow-auto">
                    {syncHistory.length > 0 ? (
                      syncHistory.slice().reverse().map((event, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 p-2 text-sm border-t">
                          <div className="col-span-2">{format(new Date(event.timestamp), 'HH:mm:ss')}</div>
                          <div className="col-span-2">{event.type}</div>
                          <div className="col-span-2">
                            {event.type === 'failure' ? (
                              <span className="text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Failed
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" /> Success
                              </span>
                            )}
                          </div>
                          <div className="col-span-2">{event.duration.toFixed(0)}ms</div>
                          <div className="col-span-4 truncate">
                            {event.affectedResources?.join(', ') || 'None'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No sync history available
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sync Frequency</label>
                      <Select onValueChange={(value) => configureSync({ frequency: value as any })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="interval">Interval (5 min)</SelectItem>
                          <SelectItem value="manual">Manual only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sync Strategy</label>
                      <Select onValueChange={(value) => configureSync({ updateStrategy: value as any })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="atomic_transactions">Atomic Transactions</SelectItem>
                          <SelectItem value="incremental">Incremental Updates</SelectItem>
                          <SelectItem value="priority_based">Priority Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sync Scope</label>
                    <Select onValueChange={(value) => configureSync({ scope: value as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_dataset">Full Dataset</SelectItem>
                        <SelectItem value="partial">Partial (Modified Only)</SelectItem>
                        <SelectItem value="delta_only">Delta Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <CardFooter className="flex justify-between p-4">
            <p className="text-sm text-muted-foreground">
              {metrics.totalSuccessfulSyncs} successful syncs, {metrics.totalFailedSyncs} failed
            </p>
            <Button onClick={() => triggerSync()} disabled={isSyncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Manual Sync'}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
