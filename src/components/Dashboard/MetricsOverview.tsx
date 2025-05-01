
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, BarChart } from "lucide-react";

interface MetricsOverviewProps {
  data: {
    totalClients: number;
    monthlyRevenue: number;
    growthRate: number;
    successRate: number;
  };
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={data.totalClients.toString()}
          description={`${data.totalClients > 100 ? "Growing" : "Stable"} student base`}
          icon={<Users className="h-6 w-6 text-blue-600" />}
        />
        
        <MetricCard
          title="Monthly Revenue"
          value={`$${data.monthlyRevenue.toLocaleString()}`}
          description={`${data.growthRate}% increase vs. last month`}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
        />
        
        <MetricCard
          title="Student Success Rate"
          value={`${data.successRate}%`}
          description="Based on retention metrics"
          icon={<BarChart className="h-6 w-6 text-amber-600" />}
        />
        
        <MetricCard
          title="Growth Rate"
          value={`${data.growthRate}%`}
          description="New enrollments this month"
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NPSScoreCard />
        <RetentionRateCard />
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-background rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NPSScoreCard() {
  // Sample NPS data - in a real app this would come from your API
  const npsScore = 8.2;
  const scoreClass = 
    npsScore >= 9 ? "text-green-600" : 
    npsScore >= 7 ? "text-amber-600" : 
    "text-red-600";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">NPS Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`text-4xl font-bold ${scoreClass}`}>
            {npsScore}
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${(npsScore / 10) * 100}%` }}
            />
          </div>
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RetentionRateCard() {
  // Sample retention data - in a real app this would come from your API
  const retentionRate = 87;
  const monthlyTrend = [82, 84, 83, 85, 87];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Retention Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="text-4xl font-bold text-center">{retentionRate}%</div>
          <div className="w-full flex items-end h-16 space-x-2">
            {monthlyTrend.map((value, i) => (
              <div 
                key={i}
                className="bg-blue-500 rounded-t w-full" 
                style={{ height: `${value}%` }}
                title={`Month ${i+1}: ${value}%`}
              />
            ))}
          </div>
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            {monthlyTrend.map((_, i) => (
              <span key={i}>M{i+1}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
