
import { useState } from "react";
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, ChevronDown, Filter, Maximize } from "lucide-react";

export function NPSChart() {
  // Mock data for the bar chart
  const barData = [
    { name: 'Abstergo', totalLeads: 400, badLeads: 240 },
    { name: 'Acme Co.', totalLeads: 300, badLeads: 139 },
    { name: 'Barone', totalLeads: 200, badLeads: 50 },
    { name: 'Biffco Ent.', totalLeads: 600, badLeads: 400 },
    { name: 'Big Kahuna', totalLeads: 350, badLeads: 150 },
  ];

  // NPS distribution data for pie chart
  const npsDistributionData = [
    { name: "Promoters", value: 72, percentage: "72%", color: "#4ade80" },
    { name: "Passive", value: 17, percentage: "17%", color: "#facc15" },
    { name: "Detractors", value: 11, percentage: "11%", color: "#f87171" },
  ];
  
  return (
    <Card className="h-full w-full shadow-sm">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">NPS Tracking</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
          </TabsList>
          
          <TabsContent value="distribution" className="mt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={npsDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${percentage}`}
                  >
                    {npsDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => {
                      return [`${value}%`, name];
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value, entry, index) => {
                      return <span style={{ color: npsDistributionData[index].color }}>{value} {npsDistributionData[index].percentage}</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      return [value, name === 'totalLeads' ? 'Total Leads' : 'Bad Leads'];
                    }}
                    contentStyle={{ fontSize: '10px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="totalLeads" stackId="a" fill="#e0e0e0" name="Total Leads" />
                  <Bar dataKey="badLeads" stackId="a" fill="#8884d8" name="Bad Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
