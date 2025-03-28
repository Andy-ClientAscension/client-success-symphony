
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
      <CardHeader className="p-0.5">
        <div className="flex items-center">
          <TrendingDown className="h-2 w-2 mr-0.5 text-red-500" />
          <CardTitle className="text-xs">Churn Rate</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0.5 pt-0">
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 2,
                right: 4,
                left: 0,
                bottom: 2,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 6 }} />
              <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 6 }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Churn Rate']} 
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ fontSize: "6px" }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#f87171"
                strokeWidth={1}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
