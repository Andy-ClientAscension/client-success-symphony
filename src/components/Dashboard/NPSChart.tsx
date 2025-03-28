
import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

export function NPSChart() {
  const [activeTab, setActiveTab] = useState("distribution");
  const [distributionData, setDistributionData] = useState(getNPSData());
  const [trendData, setTrendData] = useState(getNPSMonthlyTrend());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Updated colors with red from the Client Ascension logo 
  const COLORS = ['#FF0000', '#f59e0b', '#22c55e'];
  
  useEffect(() => {
    const loadGoogleSheetsData = async () => {
      setLoading(true);
      try {
        const data = await fetchNPSDataFromSheets();
        if (data) {
          setDistributionData(data.distributionData);
          setTrendData(data.trendData);
          toast({
            title: "NPS Data Loaded",
            description: "Successfully loaded NPS data from Google Sheets",
          });
        } else {
          // If the API fails, we'll use the mock data
          setDistributionData(getNPSData());
          setTrendData(getNPSMonthlyTrend());
        }
      } catch (error) {
        console.error("Error loading Google Sheets data:", error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load data from Google Sheets. Using backup data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadGoogleSheetsData();
  }, [toast]);
  
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
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2">Loading NPS data...</span>
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
