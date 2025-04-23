
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/lib/data";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { Activity, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

interface HealthScoreSummaryProps {
  clients: Client[];
}

type HealthScoreEntry = {
  id: string;
  clientId: string;
  clientName: string;
  score: number;
  date: string;
};

export function HealthScoreSummary({ clients }: HealthScoreSummaryProps) {
  const healthScores = useMemo(() => {
    const scores = loadData<HealthScoreEntry[]>(STORAGE_KEYS.HEALTH_SCORES, []);
    
    // Get the latest score for each client
    const clientScores = new Map<string, HealthScoreEntry>();
    scores.forEach(score => {
      const existingScore = clientScores.get(score.clientId);
      if (!existingScore || new Date(existingScore.date) < new Date(score.date)) {
        clientScores.set(score.clientId, score);
      }
    });
    
    return Array.from(clientScores.values());
  }, []);
  
  // Calculate summary metrics
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const clientsWithScores = healthScores.length;
    const missingScores = totalClients - clientsWithScores;
    
    // Score distribution
    const highScores = healthScores.filter(s => s.score >= 8).length;
    const mediumScores = healthScores.filter(s => s.score >= 5 && s.score < 8).length;
    const lowScores = healthScores.filter(s => s.score < 5).length;
    
    // Calculate percentages
    const coveragePercent = totalClients > 0 
      ? Math.round((clientsWithScores / totalClients) * 100) 
      : 0;
      
    const highPercent = clientsWithScores > 0 
      ? Math.round((highScores / clientsWithScores) * 100) 
      : 0;
      
    const mediumPercent = clientsWithScores > 0 
      ? Math.round((mediumScores / clientsWithScores) * 100) 
      : 0;
      
    const lowPercent = clientsWithScores > 0
      ? Math.round((lowScores / clientsWithScores) * 100)
      : 0;
      
    // Calculate average score
    const averageScore = clientsWithScores > 0
      ? (healthScores.reduce((sum, entry) => sum + entry.score, 0) / clientsWithScores).toFixed(1)
      : "N/A";
    
    return {
      totalClients,
      clientsWithScores,
      missingScores,
      coveragePercent,
      highScores,
      mediumScores,
      lowScores,
      highPercent,
      mediumPercent,
      lowPercent,
      averageScore
    };
  }, [clients.length, healthScores]);

  const hasData = metrics.clientsWithScores > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Health Score Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Average Score</div>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.averageScore}</div>
              <div className="text-xs text-gray-500 mt-1">
                Based on {metrics.clientsWithScores} clients
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Score Coverage</div>
                <HelpCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.coveragePercent}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.missingScores} clients without scores
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Healthy Clients</div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">{metrics.highPercent}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.highScores} clients with 8-10 score
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">At Risk Clients</div>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600">{metrics.lowPercent}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.lowScores} clients with 1-4 score
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4">
            <p className="text-muted-foreground">No health score data available.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add health scores to clients to see summary metrics.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
