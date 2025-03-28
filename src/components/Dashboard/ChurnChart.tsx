
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChurnData } from "@/lib/data";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";

export function ChurnChart() {
  const defaultData = getChurnData();
  const [data, setData] = useState(defaultData);
  
  // Load saved data if available
  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      const savedData = loadData(STORAGE_KEYS.CHURN, defaultData);
      setData(savedData);
    }
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      saveData(STORAGE_KEYS.CHURN, data);
    }
  }, [data]);
  
  // Calculate if churn is trending up or down
  const currentChurn = data[data.length - 1]?.rate || 0;
  const previousChurn = data[data.length - 2]?.rate || 0;
  const isChurnDecreasing = currentChurn < previousChurn;
  const churnDifference = Math.abs(currentChurn - previousChurn).toFixed(1);
  
  return (
    <Card className="h-full w-full shadow-sm">
      <CardHeader className="p-1 px-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xs font-semibold">Company Churn Rate</CardTitle>
          <div className="flex items-center space-x-2">
            <p className="text-base font-bold">{currentChurn}%</p>
            <div className={`flex items-center ${isChurnDecreasing ? 'text-green-600' : 'text-red-600'}`}>
              {isChurnDecreasing ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1" />
              )}
              <span className="text-[10px]">{isChurnDecreasing ? '-' : '+'}{churnDifference}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1 pt-0">
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8 }}
                tickFormatter={(value) => `${value}%`}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Churn Rate']}
                contentStyle={{ fontSize: '8px', padding: '4px' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <ReferenceLine y={2} stroke="#ccc" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#8884d8" 
                strokeWidth={1.5}
                dot={{ r: 1 }}
                activeDot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[8px] text-muted-foreground">
          <p>Industry average: <span className="font-medium">2.0%</span></p>
        </div>
      </CardContent>
    </Card>
  );
}
