
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getNPSMonthlyTrend, getChurnData } from "@/lib/data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, Clock, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CompanyMetrics() {
  const clientCounts = getClientsCountByStatus();
  const averageNPS = getAverageNPS();
  const npsMonthlyData = getNPSMonthlyTrend();
  const churnData = getChurnData();
  
  const totalClients = Object.values(clientCounts).reduce((a, b) => a + b, 0);
  const activeClientsPercentage = Math.round((clientCounts.active / totalClients) * 100);
  const atRiskPercentage = Math.round((clientCounts["at-risk"] / totalClients) * 100);
  const churnedPercentage = Math.round((clientCounts.churned / totalClients) * 100);
  const newPercentage = Math.round((clientCounts.new / totalClients) * 100);
  
  // Growth metrics (simulated)
  const growthRate = 12; // 12% growth rate
  const avgClientValue = 1200; // $1200 average client value
  const clientLifetimeMonths = 14.5; // Average client stays 14.5 months
  
  // Success metrics (simulated)
  const successRate = 84; // 84% success rate
  const averageTimeToValue = 3.2; // 3.2 months to value
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Company Overview</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <Card className="border shadow-none">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Total Clients</p>
                <h3 className="text-lg font-bold">{totalClients}</h3>
                <div className="flex items-center text-green-600 text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+{growthRate}% growth</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-none">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Active Clients</p>
                <h3 className="text-lg font-bold">{clientCounts.active}</h3>
                <div className="flex items-center text-xs">
                  <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200">
                    {activeClientsPercentage}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-none">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">At Risk</p>
                <h3 className="text-lg font-bold">{clientCounts["at-risk"]}</h3>
                <div className="flex items-center text-xs">
                  <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
                    {atRiskPercentage}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-none">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">New Clients</p>
                <h3 className="text-lg font-bold">{clientCounts.new}</h3>
                <div className="flex items-center text-xs">
                  <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">
                    {newPercentage}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-none">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <h3 className="text-lg font-bold">{successRate}%</h3>
                <div className="flex items-center text-green-600 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+2.5% this quarter</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-none">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Churn Rate</p>
                <h3 className="text-lg font-bold">{churnData[churnData.length - 1].rate}%</h3>
                <div className="flex items-center text-red-600 text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  <span>-0.2% this month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm">Growth & Retention</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
                  <div className="mr-3 p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Growth Rate</div>
                    <div className="text-sm font-semibold text-green-600">{growthRate}%</div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
                  <div className="mr-3 p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Avg. Client Value</div>
                    <div className="text-sm font-semibold">${avgClientValue}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
                  <div className="mr-3 p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Client Lifetime</div>
                    <div className="text-sm font-semibold">{clientLifetimeMonths} months</div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
                  <div className="mr-3 p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Time to Value</div>
                    <div className="text-sm font-semibold">{averageTimeToValue} months</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                        data={npsMonthlyData}
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
                  </div>
                </TabsContent>
                <TabsContent value="churn" className="pt-2">
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={churnData}
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
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
