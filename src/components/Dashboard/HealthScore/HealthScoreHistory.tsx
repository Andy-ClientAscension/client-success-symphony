
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { STORAGE_KEYS, loadData } from "@/utils/persistence";
import { format, subMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HealthScoreEntry = {
  id: string;
  clientId: string;
  clientName: string;
  score: number;
  date: string;
};

interface HealthScoreHistoryProps {
  clientId?: string;
  clientName?: string;
}

export function HealthScoreHistory({ clientId, clientName }: HealthScoreHistoryProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("6m");
  const [trendData, setTrendData] = useState<any[]>([]);
  
  useEffect(() => {
    const allScores = loadData<HealthScoreEntry[]>(STORAGE_KEYS.HEALTH_SCORES, []);
    
    // Filter scores by client if a clientId is provided
    const relevantScores = clientId 
      ? allScores.filter(score => score.clientId === clientId)
      : allScores;
    
    // Set the date range based on the selected time range
    const now = new Date();
    let startDate: Date;
    
    switch (selectedTimeRange) {
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 6); // Default to 6 months
    }
    
    if (clientId) {
      // For a single client, show all their scores over time
      const clientScores = relevantScores
        .filter(score => new Date(score.date) >= startDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setTrendData(clientScores.map(score => ({
        date: format(new Date(score.date), "MMM dd"),
        score: score.score
      })));
    } else {
      // For overall trend, calculate average scores by month
      const scoresByMonth: Record<string, number[]> = {};
      
      relevantScores
        .filter(score => new Date(score.date) >= startDate)
        .forEach(score => {
          const monthKey = format(new Date(score.date), "yyyy-MM");
          const monthScores = scoresByMonth[monthKey] || [];
          monthScores.push(score.score);
          scoresByMonth[monthKey] = monthScores;
        });
      
      const monthlyData = Object.entries(scoresByMonth).map(([month, scores]) => {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
          month: format(new Date(month), "MMM yyyy"),
          score: parseFloat(average.toFixed(1))
        };
      }).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
      
      setTrendData(monthlyData);
    }
  }, [clientId, selectedTimeRange]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {clientId ? `${clientName}'s Health Score Trend` : "Health Score Trends"}
          </CardTitle>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={clientId ? "date" : "month"} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`${value}`, 'Health Score']} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No health score data available for this {clientId ? "client" : "period"}.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
