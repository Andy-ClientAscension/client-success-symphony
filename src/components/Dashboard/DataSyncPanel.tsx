
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealtimeSyncIndicator } from "@/components/RealtimeSyncIndicator";
import { Progress } from "@/components/ui/progress";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatDistanceToNow } from "date-fns";

export function DataSyncPanel() {
  const { isRefreshing, lastUpdated } = useDashboardData({});
  
  return (
    <aside 
      className="lg:col-span-3 mb-8 animate-fade-in" 
      tabIndex={0} 
      aria-labelledby="data-sync-heading"
    >
      <h2 id="data-sync-heading" className="sr-only">Data Synchronization Status</h2>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Real-Time Sync Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <RealtimeSyncIndicator />
              {isRefreshing && (
                <Progress value={Math.floor(Math.random() * 30) + 70} className="w-1/3 h-1" />
              )}
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last sync {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
