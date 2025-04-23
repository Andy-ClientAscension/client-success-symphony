
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthScoreTrendChartProps {
  history: StudentHealth.HealthScoreHistory[];
  trends: {
    '30d': StudentHealth.HealthScoreTrend;
    '60d': StudentHealth.HealthScoreTrend;
    '90d': StudentHealth.HealthScoreTrend;
  };
  className?: string;
}

export function HealthScoreTrendChart({ 
  history, 
  trends, 
  className 
}: HealthScoreTrendChartProps) {
  const [activePeriod, setActivePeriod] = useState<'30d' | '60d' | '90d'>('30d');
  
  // Filter and format history data for the active period
  const getChartData = () => {
    const now = new Date();
    let daysToShow: number;
    
    switch (activePeriod) {
      case '60d':
        daysToShow = 60;
        break;
      case '90d':
        daysToShow = 90;
        break;
      default:
        daysToShow = 30;
    }
    
    const cutoffDate = subDays(now, daysToShow);
    
    // Filter entries and sort by date
    return history
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: entry.date,
        score: entry.score,
        formattedDate: format(parseISO(entry.date), 'MMM dd')
      }));
  };
  
  const chartData = getChartData();
  const activeTrend = trends[activePeriod];
  
  // Determine trend icon and color
  const getTrendDisplay = () => {
    const { direction, change } = activeTrend;
    
    let icon;
    let colorClass;
    
    switch (direction) {
      case 'up':
        icon = <TrendingUp className="h-4 w-4" />;
        colorClass = "text-green-600";
        break;
      case 'down':
        icon = <TrendingDown className="h-4 w-4" />;
        colorClass = "text-red-600";
        break;
      default:
        icon = <Minus className="h-4 w-4" />;
        colorClass = "text-gray-500";
    }
    
    return (
      <div className={cn("flex items-center gap-1", colorClass)}>
        {icon}
        <span className="text-sm font-medium">
          {change > 0 ? '+' : ''}{change}
        </span>
      </div>
    );
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Health Score Trend</CardTitle>
          {getTrendDisplay()}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activePeriod} 
          onValueChange={(value) => setActivePeriod(value as '30d' | '60d' | '90d')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="60d">60 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
          
          {['30d', '60d', '90d'].map((period) => (
            <TabsContent key={period} value={period} className="pt-0">
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                        tickFormatter={(value) => value}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 12 }}
                        tickCount={6}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}`, 'Health Score']}
                        labelFormatter={(label) => format(parseISO(label as string), 'MMM dd, yyyy')}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#9b87f5"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, fill: "#9b87f5", stroke: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for this period
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
