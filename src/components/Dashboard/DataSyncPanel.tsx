
import React from "react";
import { DataSyncMonitor } from "@/components/Dashboard/DataSyncMonitor";

export function DataSyncPanel() {
  return (
    <aside 
      className="lg:col-span-3 mb-8 animate-fade-in" 
      tabIndex={0} 
      aria-labelledby="data-sync-heading"
    >
      <h2 id="data-sync-heading" className="sr-only">Data Synchronization Status</h2>
      <div className="bg-card border border-border/30 p-4 rounded-lg focus-visible:ring-2 focus-visible:ring-primary transition-shadow duration-150">
        <DataSyncMonitor />
      </div>
    </aside>
  );
}
