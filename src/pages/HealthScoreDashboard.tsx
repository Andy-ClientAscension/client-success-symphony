
import { Layout } from "@/components/Layout/Layout";
import { HealthScoreSummary } from "@/components/Dashboard/HealthScore/HealthScoreSummary";
import { HealthScoreOverview } from "@/components/Dashboard/HealthScore/HealthScoreOverview";
import { HealthScoreSheet } from "@/components/Dashboard/HealthScoreSheet";
import { HealthScoreHistory } from "@/components/Dashboard/HealthScoreHistory";
import { getAllClients } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useState } from "react";

// Enhanced UI components
import { PageHeader } from "@/components/ui/page-header";
import { EnhancedErrorBoundary } from "@/components/ui/error-boundary-enhanced";
import { SkeletonChart } from "@/components/ui/skeleton-enhanced";

export default function HealthScoreDashboard() {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const clients = getAllClients();
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Health Score Dashboard"
          subtitle="Monitor and analyze client health metrics and trends"
          showBackButton
          showHomeButton
        />
        
        <Card className="card-elevated">
          <div className="p-6">
            <EnhancedErrorBoundary
              title="Error Loading Health Score Dashboard"
              showDetails={process.env.NODE_ENV === 'development'}
            >
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger 
                    value="summary"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger 
                    value="details"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Score Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trends"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Trends
                  </TabsTrigger>
                </TabsList>
                
                <div className="space-y-6">
                  <TabsContent value="summary" className="mt-0 space-y-6">
                    <EnhancedErrorBoundary title="Error Loading Health Score Summary">
                      <HealthScoreSummary clients={clients} />
                    </EnhancedErrorBoundary>
                    <EnhancedErrorBoundary title="Error Loading Health Score Overview">
                      <HealthScoreOverview clients={clients} />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Health Score Details">
                      <HealthScoreSheet clients={clients} />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="trends" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Health Score Trends">
                      <HealthScoreHistory />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                </div>
              </Tabs>
            </EnhancedErrorBoundary>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
