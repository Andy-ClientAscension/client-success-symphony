
import { useState } from "react";
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, ChevronDown, Filter, Maximize } from "lucide-react";

export function NPSChart() {
  // Mock data for the bar chart
  const barData = [
    { name: 'Abstergo', totalLeads: 400, badLeads: 240 },
    { name: 'Acme Co.', totalLeads: 300, badLeads: 139 },
    { name: 'Barone', totalLeads: 200, badLeads: 50 },
    { name: 'Biffco Ent.', totalLeads: 600, badLeads: 400 },
    { name: 'Big Kahuna', totalLeads: 350, badLeads: 150 },
  ];
  
  return (
    <Card className="h-full w-full shadow-sm">
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">Leads</CardTitle>
          <p className="text-xs text-muted-foreground">8,203 Total leads / 3,587 bad leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Maximize className="h-3 w-3 mr-1" />
            Expand
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value, name) => {
                  return [value, name === 'totalLeads' ? 'Total Leads' : 'Bad Leads'];
                }}
                contentStyle={{ fontSize: '10px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="totalLeads" stackId="a" fill="#e0e0e0" name="Total Leads" />
              <Bar dataKey="badLeads" stackId="a" fill="#8884d8" name="Bad Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
