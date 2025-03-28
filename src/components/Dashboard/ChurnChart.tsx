
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChurnData } from "@/lib/data";
import { TrendingDown } from "lucide-react";
import { useState } from "react";

export function ChurnChart() {
  const data = getChurnData();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className="h-full w-[90%] mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-1">
        <div className="flex items-center">
          <TrendingDown className={`h-3 w-3 mr-1 text-red-500 ${isHovered ? '' : 'animate-spin'}`} style={{ animationDuration: '4s' }} />
          <CardTitle className="text-xs">Churn Rate</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-1 pt-0">
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" strokeWidth={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 8 }} tickSize={3} axisLine={{ strokeWidth: 0.5 }} />
              <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 8 }} tickSize={3} axisLine={{ strokeWidth: 0.5 }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Churn Rate']} 
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ fontSize: "8px" }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#f87171"
                strokeWidth={1.5}
                activeDot={{ r: 4 }}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
