
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChurnData } from "@/lib/data";
import { ChevronDown, Filter, Maximize } from "lucide-react";
import { useState, useEffect } from "react";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";
import { Button } from "@/components/ui/button";

export function ChurnChart() {
  const defaultData = getChurnData();
  const [data, setData] = useState(defaultData);
  const [isHovered, setIsHovered] = useState(false);
  const [view, setView] = useState<'pie' | 'line'>('pie');
  
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
  
  const totalCost = 120640.50;
  const pieData = [
    { name: "Cost in time frame", value: 34, amount: 41017.77 },
    { name: "Cost per application", value: 48, amount: 57907.44 },
    { name: "Cost per sale", value: 18, amount: 21715.29 }
  ];
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];
  
  return (
    <Card 
      className="h-full w-full shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Costs</CardTitle>
          <p className="text-sm text-muted-foreground">${totalCost.toLocaleString()} Total costs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Maximize className="h-3 w-3 mr-1" />
            Expand
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <ChevronDown className="h-3 w-3 mr-1" />
            More
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan x="50%" dy="-0.5em" fontSize="16" fontWeight="bold">${totalCost.toLocaleString()}</tspan>
                  <tspan x="50%" dy="1.5em" fontSize="12" fill="#666">Total costs</tspan>
                </text>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  const entry = pieData.find(item => item.name === name);
                  return [`$${entry?.amount.toLocaleString()}`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute bottom-0 left-0 w-full">
            <div className="grid grid-cols-3 gap-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="text-xs">
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-muted-foreground">${entry.amount.toLocaleString()} ({entry.value}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
