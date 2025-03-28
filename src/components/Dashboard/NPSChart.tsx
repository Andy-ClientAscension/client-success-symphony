
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
import { fetchNPSDataFromSheets } from "@/lib/googleSheetsApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/LoadingState";
import { useQuery } from "@tanstack/react-query";
import { ValidationError } from "@/components/ValidationError";

export function NPSChart() {
  const [activeTab, setActiveTab] = useState("distribution");
  const { toast } = useToast();
  
  // Updated colors with red from the Client Ascension logo 
  const COLORS = ['#FF0000', '#f59e0b', '#22c55e'];
  
  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['nps-data'],
    queryFn: async () => {
      try {
        const response = await fetchNPSDataFromSheets();
        if (response) {
          return response;
        } else {
          // If the API fails, we'll use the mock data
          return {
            distributionData: getNPSData(),
            trendData: getNPSMonthlyTrend()
          };
        }
      } catch (error) {
        console.error("Error loading NPS data:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    // Remove the onError property and use meta for error handling
    meta: {
      errorHandler: () => {
        toast({
          title: "Error Loading Data",
          description: "Failed to load data from Google Sheets. Using backup data.",
          variant: "destructive",
        });
      }
    }
  });
  
  const distributionData = data?.distributionData || [];
  const trendData = data?.trendData || [];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>NPS Tracking</CardTitle>
        {isError && (
          <button 
            onClick={() => refetch()} 
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="distribution" className="flex-1">Distribution</TabsTrigger>
            <TabsTrigger value="trend" className="flex-1">Monthly Trend</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="h-[300px]">
              <LoadingState message="Loading NPS data..." />
            </div>
          ) : isError ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-2">Failed to load NPS data</p>
                <p className="text-sm text-muted-foreground">Using backup data instead</p>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
