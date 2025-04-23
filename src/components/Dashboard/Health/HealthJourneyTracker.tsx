
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export function HealthJourneyTracker() {
  const { clients } = useDashboardData();
  
  // Calculate average health score using npsScore instead of healthScore
  const avgHealthScore = Math.round(
    clients.reduce((acc, client) => acc + (client.npsScore || 0), 0) / clients.length
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Health & Journey Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div 
            className="space-y-2"
            role="region" 
            aria-label="Overall Health Score"
          >
            <div className="flex justify-between text-sm">
              <span>Overall Health Score</span>
              <span className="font-medium">{avgHealthScore}%</span>
            </div>
            <Progress value={avgHealthScore} aria-label={`Health score is ${avgHealthScore}%`} />
          </div>
          
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="space-y-2"
                  role="region"
                  aria-label={`Health journey for ${client.name}`}
                >
                  <div className="flex justify-between text-sm">
                    <span>{client.name}</span>
                    <span className="font-medium">{client.npsScore || 0}%</span>
                  </div>
                  <Progress 
                    value={client.npsScore || 0} 
                    aria-label={`${client.name}'s health score is ${client.npsScore || 0}%`}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
