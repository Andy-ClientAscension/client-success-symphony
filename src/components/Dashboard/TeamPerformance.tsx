
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Client } from "@/lib/data";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamPerformanceProps {
  clients: Client[];
}

export function TeamPerformance({ clients }: TeamPerformanceProps) {
  const [viewType, setViewType] = useState<string>("metrics");
  const [timePeriod, setTimePeriod] = useState<string>("month");
  
  // Sample team members - in a real app these would come from your API
  const teamMembers = [
    { id: "1", name: "Alex Johnson", role: "Success Coach", metrics: getCoachMetrics(clients, "1") },
    { id: "2", name: "Morgan Smith", role: "Success Coach", metrics: getCoachMetrics(clients, "2") },
    { id: "3", name: "Taylor Lee", role: "Success Coach", metrics: getCoachMetrics(clients, "3") }
  ];
  
  // Sample team performance data - in a real app this would come from your API
  const performanceData = generatePerformanceData(teamMembers);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Team Performance</h2>
        
        <div className="flex items-center space-x-4">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={viewType} onValueChange={setViewType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Team Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="successRate" name="Success Rate" fill="#4ade80" />
                    <Bar dataKey="npsScore" name="NPS Score" fill="#f59e0b" />
                    <Bar dataKey="completionRate" name="Completion Rate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-8">
                Showing performance trends for {timePeriod === 'month' ? 'this month' : 
                timePeriod === 'week' ? 'this week' : 
                timePeriod === 'quarter' ? 'this quarter' : 'this year'}
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={generateTrendData(timePeriod)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" name="Students Managed" fill="#3b82f6" />
                    <Bar dataKey="retention" name="Retention Rate" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamMemberCard({ member }: { member: any }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-semibold">{member.name}</h3>
          <Badge variant="outline" className="w-fit">
            {member.role}
          </Badge>
        </div>
        
        <div className="space-y-2 pt-2">
          <MetricItem label="Success Rate" value={`${member.metrics.successRate}%`} />
          <MetricItem label="Response Time" value={`${member.metrics.responseTime}h`} />
          <MetricItem label="NPS Score" value={member.metrics.npsScore.toString()} />
          <MetricItem label="Completion Rate" value={`${member.metrics.completionRate}%`} />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// Helper functions to generate sample data
function getCoachMetrics(clients: Client[], coachId: string) {
  // In a real app, you would filter clients by coach ID and calculate actual metrics
  return {
    successRate: 75 + Math.floor(Math.random() * 20),
    responseTime: 2 + Math.floor(Math.random() * 4),
    npsScore: 7 + Math.floor(Math.random() * 3),
    completionRate: 65 + Math.floor(Math.random() * 30)
  };
}

function generatePerformanceData(teamMembers: any[]) {
  return teamMembers.map(member => ({
    name: member.name,
    successRate: member.metrics.successRate,
    npsScore: member.metrics.npsScore * 10, // Scale to compare with percentages
    completionRate: member.metrics.completionRate
  }));
}

function generateTrendData(period: string) {
  const periods = 
    period === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] :
    period === 'month' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] :
    period === 'quarter' ? ['Month 1', 'Month 2', 'Month 3'] :
    ['Q1', 'Q2', 'Q3', 'Q4'];
  
  return periods.map(periodLabel => ({
    period: periodLabel,
    students: 10 + Math.floor(Math.random() * 40),
    retention: 60 + Math.floor(Math.random() * 35)
  }));
}
