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
  console.log('CleanDashboard component loading...');
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
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

          {/* Main Content - Compact Layout */}
          <main className="flex-1 p-4 space-y-4 overflow-auto max-h-screen">
            {/* Metric Cards Row - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card-metric hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-xl font-bold text-foreground">59</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-metric hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                      <p className="text-xl font-bold text-foreground">47</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +5% from last month
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-metric hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly MRR</p>
                      <p className="text-xl font-bold text-foreground">$167K</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +8.2% from last month
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-metric hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                      <p className="text-xl font-bold text-foreground">8.2</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +0.3 from last month
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid - Compact and Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
              {/* Revenue Growth Chart */}
              <Card className="card-elevated">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Revenue Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        className="text-xs text-muted-foreground"
                        fontSize={10}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        className="text-xs text-muted-foreground"
                        tickFormatter={(value) => `$${value/1000}k`}
                        fontSize={10}
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
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Student Health Distribution */}
              <Card className="card-elevated">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Student Health Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={studentHealthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={15}
                        outerRadius={25}
                        paddingAngle={2}
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
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {studentHealthData.map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <div 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xs font-medium">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Offer Performance with Chart */}
              <Card className="card-elevated">
                <CardHeader>
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      Offer Performance
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Track offer success rates and revenue impact</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Revenue Won</p>
                      <p className="text-2xl font-bold text-green-600">$0.00</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold text-blue-600">0.0%</p>
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Sent', value: 0 },
                        { name: 'Viewed', value: 0 },
                        { name: 'Responded', value: 0 },
                        { name: 'Accepted', value: 0 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Renewal Forecast with Chart */}
              <Card className="card-elevated">
                <CardHeader>
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      Renewal Forecast
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Upcoming renewals in the next 30 days</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">$0.00</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Upsell Potential</p>
                      <p className="text-2xl font-bold text-green-600">$0.00</p>
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Week 1', renewals: 0, revenue: 0 },
                        { month: 'Week 2', renewals: 0, revenue: 0 },
                        { month: 'Week 3', renewals: 0, revenue: 0 },
                        { month: 'Week 4', renewals: 0, revenue: 0 }
                      ]}>
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
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="renewals" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
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