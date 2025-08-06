import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './Layout/DashboardSidebar';
import { Search, Bell, Users, Heart, DollarSign, TrendingUp, Calendar, Target } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, students: 12 },
  { month: 'Feb', revenue: 52000, students: 15 },
  { month: 'Mar', revenue: 48000, students: 14 },
  { month: 'Apr', revenue: 61000, students: 18 },
  { month: 'May', revenue: 55000, students: 16 },
  { month: 'Jun', revenue: 67000, students: 20 },
];

const studentHealthData = [
  { name: 'Excellent (8-10)', value: 45, color: '#22c55e' },
  { name: 'Good (5-7)', value: 35, color: '#f59e0b' },
  { name: 'At Risk (1-4)', value: 20, color: '#ef4444' },
];

const performanceData = [
  { metric: 'Retention Rate', current: 87, target: 90, color: '#22c55e' },
  { metric: 'NPS Score', current: 8.2, target: 9.0, color: '#3b82f6' },
  { metric: 'Churn Rate', current: 5.2, target: 3.0, color: '#ef4444' },
  { metric: 'Avg Revenue', current: 2800, target: 3000, color: '#8b5cf6' },
];

const growthData = [
  { month: 'Jan', mrr: 125000, students: 45 },
  { month: 'Feb', mrr: 132000, students: 47 },
  { month: 'Mar', mrr: 128000, students: 46 },
  { month: 'Apr', mrr: 145000, students: 52 },
  { month: 'May', mrr: 158000, students: 56 },
  { month: 'Jun', mrr: 167000, students: 59 },
];

export function CleanDashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Client Ascension Header */}
          <header className="bg-card border-b border-border h-16 shrink-0">
            <div className="flex h-full items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">CA</span>
                  </div>
                  <h1 className="text-xl font-bold text-foreground">Client Ascension</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search students..."
                    className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium">JD</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-metric hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold text-foreground">59</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-metric hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                      <p className="text-2xl font-bold text-foreground">47</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +5% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-metric hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly MRR</p>
                      <p className="text-2xl font-bold text-foreground">$167K</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +8.2% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-metric hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                      <p className="text-2xl font-bold text-foreground">8.2</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +0.3 from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Growth Chart */}
              <Card className="card-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Revenue Growth</CardTitle>
                      <p className="text-sm text-muted-foreground">Monthly recurring revenue and student count</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-xs text-muted-foreground">MRR</span>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Students</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                          tickFormatter={(value) => `$${value/1000}k`}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'mrr' ? `$${value.toLocaleString()}` : value,
                            name === 'mrr' ? 'MRR' : 'Students'
                          ]}
                          labelClassName="text-foreground"
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="mrr" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="students" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Student Health Distribution */}
              <Card className="card-elevated">
                <CardHeader>
                  <div>
                    <CardTitle className="text-lg font-semibold">Student Health Distribution</CardTitle>
                    <p className="text-sm text-muted-foreground">Health score breakdown by risk level</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentHealthData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {studentHealthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Percentage']}
                          labelClassName="text-foreground"
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {studentHealthData.map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xs font-medium">{item.value}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="card-elevated">
                <CardHeader>
                  <div>
                    <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Key performance indicators vs targets</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-6">
                    {performanceData.map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{metric.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {typeof metric.current === 'number' && metric.current > 100 
                                ? `$${metric.current.toLocaleString()}` 
                                : metric.current}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              / {typeof metric.target === 'number' && metric.target > 100 
                                ? `$${metric.target.toLocaleString()}` 
                                : metric.target}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((metric.current / metric.target) * 100, 100)}%`,
                              backgroundColor: metric.color 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress: {((metric.current / metric.target) * 100).toFixed(1)}%</span>
                          <span>Target: {typeof metric.target === 'number' && metric.target > 100 
                            ? `$${metric.target.toLocaleString()}` 
                            : metric.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Revenue Breakdown */}
              <Card className="card-elevated">
                <CardHeader>
                  <div>
                    <CardTitle className="text-lg font-semibold">Monthly Revenue Breakdown</CardTitle>
                    <p className="text-sm text-muted-foreground">Revenue vs student count by month</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                          tickFormatter={(value) => `$${value/1000}k`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'revenue' ? `$${value.toLocaleString()}` : value,
                            name === 'revenue' ? 'Revenue' : 'Students'
                          ]}
                          labelClassName="text-foreground"
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}