
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientList } from "./ClientList";
import { TeamAnalytics } from "./TeamAnalytics";
import { EnhancedKanbanBoard } from "./EnhancedKanbanBoard";
import { CheckCircle, AlertTriangle, UserPlus, XCircle, BarChart2 } from "lucide-react";
import { getAllClients } from "@/lib/data";
import { focusRingClasses } from "@/lib/accessibility";
import { SkipLink } from "./Accessibility/SkipLink";

interface ClientsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  forceReload: number;
}

export function ClientsTabs({ activeTab, onTabChange, forceReload }: ClientsTabsProps) {
  const clients = getAllClients();
  
  // This effect ensures we don't lose track of tab state during rendering
  useEffect(() => {
    // Ensure tab initialization
    if (!activeTab) {
      onTabChange("all");
    }
  }, [activeTab, onTabChange]);

  return (
    <div>
      <SkipLink targetId="clients-content" label="Skip to clients content" />
      
      <Tabs 
        value={activeTab} 
        onValueChange={onTabChange} 
        className="w-full"
        defaultValue="all"
        aria-label="Client Management Sections"
      >
        <div className="overflow-x-auto border-b mb-4">
          <TabsList 
            className="w-full md:w-auto justify-start bg-transparent p-0 flex-nowrap mb-0"
            aria-label="Client status filters"
          >
            <TabsTrigger 
              value="all" 
              className={`data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 
                rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap ${focusRingClasses}`}
              aria-label="All Clients"
            >
              All Clients
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className={`data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 
                rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap ${focusRingClasses}`}
              aria-label="Active Clients"
            >
              <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="at-risk" 
              className={`data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 
                rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap ${focusRingClasses}`}
              aria-label="At Risk Clients"
            >
              <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
              At Risk
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className={`data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 
                rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap ${focusRingClasses}`}
              aria-label="New Clients"
            >
              <UserPlus className="h-3 w-3 mr-1" aria-hidden="true" />
              New
            </TabsTrigger>
            <TabsTrigger 
              value="churned" 
              className={`data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 
                rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap ${focusRingClasses}`}
              aria-label="Churned Clients"
            >
              <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
              Churned
            </TabsTrigger>
            <TabsTrigger 
              value="team-health" 
              className={`data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 
                rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap ${focusRingClasses}`}
              aria-label="Team Health Analytics"
            >
              <BarChart2 className="h-3 w-3 mr-1" aria-hidden="true" />
              Team Health
            </TabsTrigger>
            <TabsTrigger 
              value="student-tracking" 
              className={`data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 
                rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap ${focusRingClasses}`}
              aria-label="Student Tracking Board"
            >
              Student Tracking
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div id="clients-content" role="region" aria-label="Client content area">
          {/* Use memo pattern to prevent unnecessary rerenders */}
          <TabsContent 
            value="all" 
            className="m-0"
            tabIndex={0}
            aria-label="All Clients Content"
          >
            <ClientList key={`all-${forceReload}`} />
          </TabsContent>
          
          <TabsContent 
            value="active" 
            className="m-0"
            tabIndex={0}
            aria-label="Active Clients Content"
          >
            <ClientList key={`active-${forceReload}`} statusFilter="active" />
          </TabsContent>
          
          <TabsContent 
            value="at-risk" 
            className="m-0"
            tabIndex={0}
            aria-label="At Risk Clients Content"
          >
            <ClientList key={`at-risk-${forceReload}`} statusFilter="at-risk" />
          </TabsContent>
          
          <TabsContent 
            value="new" 
            className="m-0"
            tabIndex={0}
            aria-label="New Clients Content"
          >
            <ClientList key={`new-${forceReload}`} statusFilter="new" />
          </TabsContent>
          
          <TabsContent 
            value="churned" 
            className="m-0"
            tabIndex={0}
            aria-label="Churned Clients Content"
          >
            <ClientList key={`churned-${forceReload}`} statusFilter="churned" />
          </TabsContent>
          
          <TabsContent 
            value="team-health" 
            className="m-0"
            tabIndex={0}
            aria-label="Team Health Analytics Content"
          >
            <TeamAnalytics key={`team-health-${forceReload}`} />
          </TabsContent>
          
          <TabsContent 
            value="student-tracking" 
            className="m-0 p-0"
            tabIndex={0}
            aria-label="Student Tracking Board Content"
          >
            <EnhancedKanbanBoard key={`kanban-${forceReload}`} fullScreen={false} clients={clients} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
