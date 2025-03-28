
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

export function ChurnChart() {
  const data = getChurnData();
  
  return (
    <Card className="h-full">
      <CardHeader className="p-2">
        <div className="flex items-center">
          <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
          <CardTitle className="text-sm">Churn Rate Trend</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Churn Rate']} 
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ fontSize: "10px" }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#f87171"
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
