
import React from "react";
import { HealthScoreCard } from "../HealthScore/HealthScoreCard";
import { ClientBiWeeklyNotes } from "../ClientBiWeeklyNotes";

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
  );
}
