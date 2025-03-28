
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

export function ChurnChart() {
  const data = getChurnData();
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Churn Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Churn Rate']} 
                labelFormatter={(label) => `Month: ${label}`} 
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#f87171"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
