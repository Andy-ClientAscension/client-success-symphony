
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
import { RefreshCw, ChartPie, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NPSChart() {
  const [activeTab, setActiveTab] = useState("distribution");
  const { toast } = useToast();
  
  // Updated colors with red from the Client Ascension logo 
  const COLORS = ['#FF0000', '#f59e0b', '#22c55e'];
  
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
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
    meta: {
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Error Loading Data",
            description: "Failed to load data from Google Sheets. Using backup data.",
            variant: "destructive",
          });
        }
      }
    }
  });
  
  const distributionData = data?.distributionData || [];
  const trendData = data?.trendData || [];
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : "Failed to load NPS data. Using backup data.";
  
  return (
    <Card className="h-full">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[0.6rem]">NPS Tracking</CardTitle>
          {(isError || isFetching) && (
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              size="sm"
              disabled={isFetching}
              className="h-3 text-[6px] px-0.5 py-0"
            >
              <RefreshCw className={`h-1.5 w-1.5 mr-0.5 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Loading...' : 'Retry'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-0 w-full h-4">
            <TabsTrigger value="distribution" className="flex-1 h-3 text-[6px]">
              <ChartPie className="mr-0.5 h-1.5 w-1.5" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="trend" className="flex-1 h-3 text-[6px]">
              <TrendingUp className="mr-0.5 h-1.5 w-1.5" />
              Monthly Trend
            </TabsTrigger>
          </TabsList>
          
          {isLoading || isFetching ? (
            <div className="h-[70px]">
              <LoadingState message="Loading NPS data..." color="primary" />
            </div>
          ) : isError ? (
            <div className="h-[70px] flex flex-col items-center justify-center">
              <ValidationError 
                message={errorMessage} 
                type="error" 
                className="mb-0.5 max-w-md text-center text-[6px]"
              />
              <p className="text-[6px] text-muted-foreground">Using backup data instead</p>
            </div>
          ) : (
            <>
              <TabsContent value="distribution" className="h-[70px] mt-0">
                {distributionData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <ValidationError 
                      message="No distribution data available" 
                      type="info"
                      className="text-[6px]"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="40%"
                        labelLine={false}
                        outerRadius={20}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "5px" }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} wrapperStyle={{ fontSize: "5px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              
              <TabsContent value="trend" className="h-[70px] mt-0">
                {trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <ValidationError 
                      message="No trend data available" 
                      type="info"
                      className="text-[6px]"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" strokeWidth={0.5} />
                      <XAxis dataKey="month" tick={{ fontSize: 5 }} tickSize={2} axisLine={{ strokeWidth: 0.5 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 5 }} tickSize={2} axisLine={{ strokeWidth: 0.5 }} />
                      <Tooltip contentStyle={{ fontSize: "5px" }} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#FF0000"
                        strokeWidth={0.8}
                        activeDot={{ r: 2 }}
                        dot={{ r: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
