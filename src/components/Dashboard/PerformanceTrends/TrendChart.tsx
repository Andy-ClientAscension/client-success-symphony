
import { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BarChart2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TrendChartProps {
  title: string;
  data: any[];
  dataKeys: {
    name: string;
    color: string;
  }[];
  xAxisKey: string;
}

export function TrendChart({ title, data, dataKeys, xAxisKey }: TrendChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key) => (
              <Line
                key={key.name}
                type="monotone"
                dataKey={key.name}
                stroke={key.color}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key) => (
              <Bar key={key.name} dataKey={key.name} fill={key.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant={chartType === 'line' ? "default" : "outline"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setChartType('line')}
            >
              <AreaChart className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === 'bar' ? "default" : "outline"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setChartType('bar')}
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
}
