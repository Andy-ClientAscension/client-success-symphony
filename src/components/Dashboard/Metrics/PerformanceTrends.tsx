
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerformanceTrendsProps {
  npsMonthlyData: Array<{
    month: string;
    score: number;
  }>;
  churnData: Array<{
    month: string;
    rate: number;
  }>;
}

export function PerformanceTrends({ npsMonthlyData, churnData }: PerformanceTrendsProps) {
  // Default data in case the props are empty
  const hasNpsData = Array.isArray(npsMonthlyData) && npsMonthlyData.length > 0;
  const hasChurnData = Array.isArray(churnData) && churnData.length > 0;
  
  // Fallback data if needed
  const defaultNpsData = [
    { month: "Jan", score: 0 },
    { month: "Feb", score: 0 },
    { month: "Mar", score: 0 }
  ];
  
  const defaultChurnData = [
    { month: "Jan", rate: 0 },
    { month: "Feb", rate: 0 },
    { month: "Mar", rate: 0 }
  ];
  
  // Use actual data or fallback
  const npsData = hasNpsData ? npsMonthlyData : defaultNpsData;
  const churningData = hasChurnData ? churnData : defaultChurnData;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Tabs defaultValue="nps">
          <TabsList className="grid w-full grid-cols-2 h-7">
            <TabsTrigger value="nps" className="text-xs py-0">NPS Trend</TabsTrigger>
            <TabsTrigger value="churn" className="text-xs py-0">Churn Rate</TabsTrigger>
          </TabsList>
          <TabsContent value="nps" className="pt-2">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={npsData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value}`, 'NPS Score']} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4ade80" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
              {!hasNpsData && (
                <div className="text-center text-xs text-muted-foreground mt-2">
                  No NPS data available
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="churn" className="pt-2">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={churningData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Churn Rate']} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#f87171" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
              {!hasChurnData && (
                <div className="text-center text-xs text-muted-foreground mt-2">
                  No churn data available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
