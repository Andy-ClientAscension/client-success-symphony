
import React from 'react';
import { Layout } from "@/components/Layout/Layout";
import { DashboardKPIHeader } from "@/components/Dashboard/Metrics/DashboardKPIHeader";
import { SSCPerformanceOverview } from "@/components/Dashboard/Performance/SSCPerformanceOverview";
import { HealthJourneyTracker } from "@/components/Dashboard/Health/HealthJourneyTracker";
import { ClientList } from "@/components/Dashboard/ClientList";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <Layout>
      <main className="container py-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {/* Top stroke - KPIs */}
        <DashboardKPIHeader />
        
        {/* Middle section with F-pattern layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left and middle content */}
          <div className="lg:col-span-2 space-y-6">
            <SSCPerformanceOverview />
            
            {/* Bottom section - Detailed lists and analytics */}
            <Card className="p-6">
              <ClientList />
            </Card>
          </div>
          
          {/* Right column - Health scores and journey tracking */}
          <aside className="lg:col-span-1">
            <HealthJourneyTracker />
          </aside>
        </div>
      </main>
    </Layout>
  );
}
