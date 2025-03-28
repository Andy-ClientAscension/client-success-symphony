
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
      <CardHeader className="p-0">
        <div className="flex items-center">
          <TrendingDown className="h-1.5 w-1.5 mr-0.5 text-red-500" />
          <CardTitle className="text-[0.6rem]">Churn Rate</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <div className="h-[70px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" strokeWidth={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 5 }} tickSize={2} axisLine={{ strokeWidth: 0.5 }} />
              <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 5 }} tickSize={2} axisLine={{ strokeWidth: 0.5 }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Churn Rate']} 
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ fontSize: "5px" }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#f87171"
                strokeWidth={0.8}
                activeDot={{ r: 2 }}
                dot={{ r: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
