import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Client } from '@/lib/data';

interface ChartComponentsProps {
  allClients: Client[];
  teamStatusCounts: any;
  isLoading: boolean;
}

const ChartComponents = React.memo(({ allClients, teamStatusCounts, isLoading }: ChartComponentsProps) => {
  // Memoized chart data calculations
  const chartData = useMemo(() => {
    if (!allClients || allClients.length === 0) {
      return {
        trendData: [],
        pieData: []
      };
    }

    // Generate trend data (mock for now - could be calculated from real data)
    const trendData = [
      { month: 'Jan', churn: 5, retention: 95 },
      { month: 'Feb', churn: 7, retention: 93 },
      { month: 'Mar', churn: 6, retention: 94 },
      { month: 'Apr', churn: 8, retention: 92 },
      { month: 'May', churn: 9, retention: 91 },
      { month: 'Jun', churn: 8, retention: 92 }
    ];

    // Pie chart data from actual status counts
    const pieData = [
      { 
        name: 'Active', 
        value: teamStatusCounts?.active || 0, 
        color: 'hsl(var(--success))',
        fill: 'hsl(var(--success))'
      },
      { 
        name: 'At Risk', 
        value: teamStatusCounts?.atRisk || 0, 
        color: 'hsl(var(--warning))',
        fill: 'hsl(var(--warning))'
      },
      { 
        name: 'New', 
        value: teamStatusCounts?.new || 0, 
        color: 'hsl(var(--primary))',
        fill: 'hsl(var(--primary))'
      },
      { 
        name: 'Churned', 
        value: teamStatusCounts?.churned || 0, 
        color: 'hsl(var(--destructive))',
        fill: 'hsl(var(--destructive))'
      }
    ].filter(item => item.value > 0);

    return { trendData, pieData };
  }, [allClients, teamStatusCounts]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-5 w-32 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Churn Trend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Churn Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            role="img" 
            aria-label="Line chart showing churn and retention trends over 6 months"
            style={{ width: '100%', height: '300px' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData.trendData}
                aria-label="Churn and retention trends"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))"
                />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="churn" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Churn Rate"
                  dot={{ fill: 'hsl(var(--destructive))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="retention" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Retention Rate"
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Client Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            role="img" 
            aria-label={`Pie chart showing client distribution: ${chartData.pieData.map(d => `${d.name}: ${d.value}`).join(', ')}`}
            style={{ width: '100%', height: '300px' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ChartComponents.displayName = 'ChartComponents';

export default ChartComponents;