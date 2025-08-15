
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/lib/data";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";

interface HealthScoreOverviewProps {
  clients: Client[];
}

type HealthScoreEntry = {
  id: string;
  clientId: string;
  clientName: string;
  team: string;
  score: number;
  date: string;
};

export function HealthScoreOverview({ clients }: HealthScoreOverviewProps) {
  const { toast } = useToast();
  
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
  
  // Prepare data for distribution chart
  const distributionData = useMemo(() => {
    const scoreRanges = [
      { name: "1-2", range: [1, 2], color: "#ef4444" },
      { name: "3-4", range: [3, 4], color: "#f97316" },
      { name: "5-6", range: [5, 6], color: "#facc15" },
      { name: "7-8", range: [7, 8], color: "#84cc16" },
      { name: "9-10", range: [9, 10], color: "#22c55e" }
    ];
    
    return scoreRanges.map(range => {
      const count = healthScores.filter(
        score => score.score >= range.range[0] && score.score <= range.range[1]
      ).length;
      
      return {
        name: range.name,
        value: count,
        color: range.color
      };
    });
  }, [healthScores]);
  
  // Check if we have any real data
  const hasDistributionData = distributionData.some(item => item.value > 0);
  
  // Prepare data for team comparison
  const teamComparisonData = useMemo(() => {
    const teamScores = new Map<string, number[]>();
    
    healthScores.forEach(score => {
      if (!score.team) return;
      
      const scores = teamScores.get(score.team) || [];
      scores.push(score.score);
      teamScores.set(score.team, scores);
    });
    
    return Array.from(teamScores.entries()).map(([team, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      return {
        team,
        avgScore: parseFloat(avgScore.toFixed(1)),
        count: scores.length
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [healthScores]);
  
  // Check if we have any team data
  const hasTeamData = teamComparisonData.length > 0;
  
  const handleChartClick = () => {
    toast({
      title: "Chart Interaction",
      description: "Click on chart segments for more details (feature coming soon)"
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Health Score Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Score Distribution</h3>
            <button 
              className="h-[300px] w-full p-4 rounded-lg border border-border hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              onClick={handleChartClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChartClick();
                }
              }}
              aria-label="View health score distribution details"
              type="button"
            >
              {hasDistributionData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip 
                      formatter={(value) => [`${value} clients`, 'Count']}
                      labelFormatter={(label) => `Score ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">No health score data available</p>
                 </div>
               )}
             </button>
           </div>
          
          <div>
            <h3 className="text-sm font-medium mb-4">Team Comparison</h3>
            <div className="h-[300px]">
              {hasTeamData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamComparisonData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm">
                              <p className="font-medium">{payload[0].payload.team}</p>
                              <p>Avg Score: {payload[0].payload.avgScore}</p>
                              <p>Clients: {payload[0].payload.count}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="avgScore" 
                      fill="#8884d8" 
                      name="Average Score"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">No team data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
