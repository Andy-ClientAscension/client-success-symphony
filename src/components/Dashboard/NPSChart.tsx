
import { useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip, 
  LineChart, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getNPSData, getNPSMonthlyTrend } from "@/lib/data";

export function NPSChart() {
  const [activeTab, setActiveTab] = useState("distribution");
  const distributionData = getNPSData();
  const trendData = getNPSMonthlyTrend();
  
  // Updated colors with red from the Client Ascension logo 
  const COLORS = ['#FF0000', '#f59e0b', '#22c55e'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>NPS Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="distribution" className="flex-1">Distribution</TabsTrigger>
            <TabsTrigger value="trend" className="flex-1">Monthly Trend</TabsTrigger>
          </TabsList>
          
          <TabsContent value="distribution" className="h-[300px]">
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="trend" className="h-[300px]">
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
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#FF0000"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
