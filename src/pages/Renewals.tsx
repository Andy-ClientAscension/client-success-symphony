
import React from "react";
import { Layout } from "@/components/Layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RenewalForecastPanel } from "@/components/Dashboard/RenewalForecastPanel";
import { BackendOffersTracker } from "@/components/Dashboard/BackendOffersTracker";
import { RenewalsSummary } from "@/components/Dashboard/RenewalsSummary";
import { TaskManager } from "@/components/Dashboard/TaskManager";
import { CommunicationCenter } from "@/components/Dashboard/CommunicationCenter";

// Enhanced UI components
import { PageHeader } from "@/components/ui/page-header";
import { EnhancedErrorBoundary } from "@/components/ui/error-boundary-enhanced";
import { Card } from "@/components/ui/card";

export default function Renewals() {
  const [activeSection, setActiveSection] = React.useState("forecasts");
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Renewals Management"
          subtitle="Track renewals, manage offers, and monitor client communications"
          showBackButton
          showHomeButton
        />
        
        <Card className="card-elevated">
          <div className="p-6">
            <EnhancedErrorBoundary
              title="Error Loading Renewals Dashboard"
              showDetails={process.env.NODE_ENV === 'development'}
            >
              <Tabs 
                value={activeSection} 
                onValueChange={setActiveSection} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger 
                    value="forecasts"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Forecasts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="offers"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Offers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="summary"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger 
                    value="communications"
                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Communications
                  </TabsTrigger>
                </TabsList>
                
                <div className="space-y-4">
                  <TabsContent value="forecasts" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Renewal Forecasts">
                      <RenewalForecastPanel />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="offers" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Backend Offers">
                      <BackendOffersTracker />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="summary" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Renewals Summary">
                      <RenewalsSummary />
                    </EnhancedErrorBoundary>
                  </TabsContent>

                  <TabsContent value="tasks" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Task Manager">
                      <TaskManager />
                    </EnhancedErrorBoundary>
                  </TabsContent>

                  <TabsContent value="communications" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Communication Center">
                      <CommunicationCenter />
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
