
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
      <CardHeader className="p-0.5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs">NPS Tracking</CardTitle>
          {(isError || isFetching) && (
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              size="sm"
              disabled={isFetching}
              className="h-4 text-[8px] px-1 py-0"
            >
              <RefreshCw className={`h-2 w-2 mr-0.5 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Loading...' : 'Retry'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0.5 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-0.5 w-full h-5">
            <TabsTrigger value="distribution" className="flex-1 h-4 text-[8px]">
              <ChartPie className="mr-0.5 h-2 w-2" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="trend" className="flex-1 h-4 text-[8px]">
              <TrendingUp className="mr-0.5 h-2 w-2" />
              Monthly Trend
            </TabsTrigger>
          </TabsList>
          
          {isLoading || isFetching ? (
            <div className="h-[100px]">
              <LoadingState message="Loading NPS data..." color="primary" />
            </div>
          ) : isError ? (
            <div className="h-[100px] flex flex-col items-center justify-center">
              <ValidationError 
                message={errorMessage} 
                type="error" 
                className="mb-0.5 max-w-md text-center text-[8px]"
              />
              <p className="text-[8px] text-muted-foreground">Using backup data instead</p>
            </div>
          ) : (
            <>
              <TabsContent value="distribution" className="h-[100px] mt-0">
                {distributionData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <ValidationError 
                      message="No distribution data available" 
                      type="info"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "6px" }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} wrapperStyle={{ fontSize: "6px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              
              <TabsContent value="trend" className="h-[100px] mt-0">
                {trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <ValidationError 
                      message="No trend data available" 
                      type="info"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{
                        top: 2,
                        right: 4,
                        left: 0,
                        bottom: 2,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 6 }} />
                      <Tooltip contentStyle={{ fontSize: "6px" }} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#FF0000"
                        strokeWidth={1}
                        activeDot={{ r: 3 }}
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
