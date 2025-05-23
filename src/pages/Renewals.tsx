
import React from "react";
import { Layout } from "@/components/Layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RenewalForecastPanel } from "@/components/Dashboard/RenewalForecastPanel";
import { BackendOffersTracker } from "@/components/Dashboard/BackendOffersTracker";
import { RenewalsSummary } from "@/components/Dashboard/RenewalsSummary";
import { TaskManager } from "@/components/Dashboard/TaskManager";
import { CommunicationCenter } from "@/components/Dashboard/CommunicationCenter";

export default function Renewals() {
  const [activeSection, setActiveSection] = React.useState("forecasts");
  
  return (
    <Layout>
      <ErrorBoundary>
        <div className="container py-6 max-w-6xl">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-6">
            <TabsList>
              <TabsTrigger value="forecasts">Renewal Forecasts</TabsTrigger>
              <TabsTrigger value="offers">Backend Offers</TabsTrigger>
              <TabsTrigger value="summary">Renewals Summary</TabsTrigger>
              <TabsTrigger value="tasks">Task Manager</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="forecasts" className="mt-0">
              <RenewalForecastPanel />
            </TabsContent>
            
            <TabsContent value="offers" className="mt-0">
              <BackendOffersTracker />
            </TabsContent>
            
            <TabsContent value="summary" className="mt-0">
              <RenewalsSummary />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <TaskManager />
            </TabsContent>

            <TabsContent value="communications" className="mt-0">
              <CommunicationCenter />
            </TabsContent>
          </Tabs>
        </div>
      </ErrorBoundary>
    </Layout>
  );
}
