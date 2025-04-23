
import React from "react";
import { HealthScoreCard } from "../HealthScore/HealthScoreCard";
import { ClientBiWeeklyNotes } from "../ClientBiWeeklyNotes";
import { StudentHealthDashboard } from "@/components/StudentHealth/StudentHealthDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ClientProgressSectionProps {
  client: {
    id: string;
    name: string;
    healthScore?: number;
    lastWeekHealthScore?: number;
  };
}

export function ClientProgressSection({ client }: ClientProgressSectionProps) {
  const healthScoreDiff = client.healthScore && client.lastWeekHealthScore
    ? client.healthScore - client.lastWeekHealthScore
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HealthScoreCard
          score={client.healthScore || 0}
          trend={healthScoreDiff !== 0 ? {
            direction: healthScoreDiff > 0 ? 'up' : 'down',
            value: Math.abs(healthScoreDiff)
          } : undefined}
          factors={[
            {
              label: "Engagement",
              impact: "positive",
              value: "+15%"
            },
            {
              label: "Call Attendance",
              impact: "negative",
              value: "-5%"
            }
          ]}
        />
        <div className="flex items-start justify-end">
          <ClientBiWeeklyNotes
            clientId={client.id}
            clientName={client.name}
          />
        </div>
      </div>
      
      <Tabs defaultValue="health-dashboard" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="health-dashboard">Student Health</TabsTrigger>
          <TabsTrigger value="notes-history">Progress Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="health-dashboard">
          <StudentHealthDashboard 
            studentId={client.id}
            studentName={client.name}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="notes-history">
          <div className="bg-gray-50 border rounded-lg p-4 mt-4">
            <p className="text-center text-muted-foreground py-4">
              Full note history is available via the Bi-Weekly Notes button
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
