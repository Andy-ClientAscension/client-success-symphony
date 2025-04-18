
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientList } from "./ClientList";
import { TeamAnalytics } from "./TeamAnalytics";
import { EnhancedKanbanBoard } from "./EnhancedKanbanBoard";
import { BarChart2 } from "lucide-react";
import { getAllClients } from "@/lib/data";

interface ClientsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  forceReload: number;
}

export function ClientsTabs({ activeTab, onTabChange, forceReload }: ClientsTabsProps) {
  const clients = getAllClients();
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="overflow-x-auto border-b mb-4">
        <TabsList className="w-full md:w-auto justify-start bg-transparent p-0 flex-nowrap mb-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
          >
            All Clients
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="at-risk" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
          >
            At Risk
          </TabsTrigger>
          <TabsTrigger 
            value="new" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
          >
            New
          </TabsTrigger>
          <TabsTrigger 
            value="churned" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
          >
            Churned
          </TabsTrigger>
          <TabsTrigger 
            value="team-health" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
          >
            <BarChart2 className="h-3 w-3 mr-1" />
            Team Health
          </TabsTrigger>
          <TabsTrigger 
            value="student-tracking" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
          >
            Student Tracking
          </TabsTrigger>
        </TabsList>
      </div>
      
      {/* Use key prop to force remount components only when needed */}
      <TabsContent value="all" className="m-0">
        <ClientList key={`all-${forceReload}`} />
      </TabsContent>
      
      <TabsContent value="active" className="m-0">
        <ClientList key={`active-${forceReload}`} statusFilter="active" />
      </TabsContent>
      
      <TabsContent value="at-risk" className="m-0">
        <ClientList key={`at-risk-${forceReload}`} statusFilter="at-risk" />
      </TabsContent>
      
      <TabsContent value="new" className="m-0">
        <ClientList key={`new-${forceReload}`} statusFilter="new" />
      </TabsContent>
      
      <TabsContent value="churned" className="m-0">
        <ClientList key={`churned-${forceReload}`} statusFilter="churned" />
      </TabsContent>
      
      <TabsContent value="team-health" className="m-0">
        <TeamAnalytics key={`team-health-${forceReload}`} />
      </TabsContent>
      
      <TabsContent value="student-tracking" className="m-0 p-0">
        <EnhancedKanbanBoard key={`kanban-${forceReload}`} fullScreen={false} clients={clients} />
      </TabsContent>
    </Tabs>
  );
}
