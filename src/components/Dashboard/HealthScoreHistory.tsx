
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getHealthScores } from "@/utils/persistence";
import { format, subMonths, isAfter } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HealthScoreHistoryProps {
  clientId?: string;
  clientName?: string;
}

export function HealthScoreHistory({ clientId, clientName }: HealthScoreHistoryProps) {
  const [timeRange, setTimeRange] = React.useState("3m");
  const [chartType, setChartType] = React.useState<"line" | "bar">("line");
  
  // Get health score data
  const healthScoreData = useMemo(() => {
    const allScores = getHealthScores(clientId);
    
    // Sort by date (oldest first)
    const sortedScores = [...allScores].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Filter by time range
    const cutoffDate = (() => {
      switch (timeRange) {
        case "1m": return subMonths(new Date(), 1);
        case "3m": return subMonths(new Date(), 3);
        case "6m": return subMonths(new Date(), 6);
        case "12m": return subMonths(new Date(), 12);
        default: return subMonths(new Date(), 3);
      }
    })();
    
    return sortedScores.filter(score => 
      isAfter(new Date(score.date), cutoffDate)
    );
  }, [clientId, timeRange]);
  
  // Calculate trend and metrics
  const metrics = useMemo(() => {
    if (healthScoreData.length === 0) return { trend: 0, average: 0, min: 0, max: 0 };
    
    const scores = healthScoreData.map(item => item.score);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    // Calculate trend (difference between latest and first score)
    const trend = healthScoreData.length > 1 
      ? healthScoreData[healthScoreData.length - 1].score - healthScoreData[0].score
      : 0;
    
    return { trend, average: parseFloat(average.toFixed(1)), min, max };
  }, [healthScoreData]);
  
  // Format data for chart
  const chartData = useMemo(() => {
    return healthScoreData.map(item => ({
      date: format(new Date(item.date), "MMM dd"),
      score: item.score,
      notes: item.notes,
    }));
  }, [healthScoreData]);
  
  // Helper to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 8) return "#22c55e"; // green
    if (score >= 5) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };
  
  // Get trend indicator
  const getTrendIndicator = () => {
    if (metrics.trend > 0) return <TrendingUp className="h-4 w-4 ml-1 text-green-500" />;
    if (metrics.trend < 0) return <TrendingDown className="h-4 w-4 ml-1 text-red-500" />;
    return <Minus className="h-4 w-4 ml-1 text-gray-500" />;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <CardTitle className="text-lg font-semibold">
            {clientName ? `${clientName}'s Health History` : "Health Score History"}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-3">
                <p className="text-xs">
                  Track client health score changes over time. Higher scores (8-10) indicate healthy clients,
                  medium scores (5-7) require attention, and low scores (1-4) indicate at-risk clients.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md">
            <Button
              variant={chartType === "line" ? "ghost" : "ghost"}
              className={`h-8 px-3 ${chartType === "line" ? "bg-gray-100" : ""}`}
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
            <Button
              variant={chartType === "bar" ? "ghost" : "ghost"}
              className={`h-8 px-3 ${chartType === "bar" ? "bg-gray-100" : ""}`}
              onClick={() => setChartType("bar")}
            >
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {healthScoreData.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                <span className="text-sm text-muted-foreground mb-1">Trend</span>
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${
                    metrics.trend > 0 ? "text-green-500" : 
                    metrics.trend < 0 ? "text-red-500" : "text-gray-500"
                  }`}>
                    {metrics.trend > 0 ? `+${metrics.trend}` : metrics.trend}
                  </span>
                  {getTrendIndicator()}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                <span className="text-sm text-muted-foreground mb-1">Average</span>
                <span className="text-lg font-bold">{metrics.average}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                <span className="text-sm text-muted-foreground mb-1">Lowest</span>
                <span className={`text-lg font-bold ${getScoreColor(metrics.min)}`}>
                  {metrics.min}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                <span className="text-sm text-muted-foreground mb-1">Highest</span>
                <span className={`text-lg font-bold ${getScoreColor(metrics.max)}`}>
                  {metrics.max}
                </span>
              </div>
            </div>
            
            <div className="h-60 w-full">
              <ChartContainer 
                config={{
                  score: {
                    label: 'Health Score',
                    color: '#ef4444',
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border p-2 rounded-md shadow-md">
                                <p className="font-medium">Date: {payload[0].payload.date}</p>
                                <p className="font-medium">Score: {payload[0].value}</p>
                                {payload[0].payload.notes && (
                                  <p className="text-xs mt-1">{payload[0].payload.notes}</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4 }} 
                        activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }} 
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border p-2 rounded-md shadow-md">
                                <p className="font-medium">Date: {payload[0].payload.date}</p>
                                <p className="font-medium">Score: {payload[0].value}</p>
                                {payload[0].payload.notes && (
                                  <p className="text-xs mt-1">{payload[0].payload.notes}</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill="#ef4444" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            {healthScoreData.length === 1 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Only one health score recorded. Add more scores to see trends over time.
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-60">
            <p className="text-muted-foreground">No health score data available for this period.</p>
            {!clientId && (
              <p className="text-sm text-muted-foreground mt-1">
                Select a client to view their health score history.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
