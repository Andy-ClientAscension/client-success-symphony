
import { Layout } from "@/components/Layout/Layout";
import { HealthScoreSummary } from "@/components/Dashboard/HealthScore/HealthScoreSummary";
import { HealthScoreOverview } from "@/components/Dashboard/HealthScore/HealthScoreOverview";
import { HealthScoreSheet } from "@/components/Dashboard/HealthScoreSheet";
import { HealthScoreHistory } from "@/components/Dashboard/HealthScoreHistory";
import { getAllClients } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function HealthScoreDashboard() {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const clients = getAllClients();
  
  return (
    <Layout>
      <div className="space-y-4 pb-12 w-full">
        <div className="text-lg font-bold">Health Score Dashboard</div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Score Details</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4 space-y-4">
            <HealthScoreSummary clients={clients} />
            <HealthScoreOverview clients={clients} />
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            <HealthScoreSheet clients={clients} />
          </TabsContent>
          
          <TabsContent value="trends" className="mt-4">
            <HealthScoreHistory />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
