
import { useState } from "react";
import { 
  BarChart,
  Bar,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getNPSData, getNPSMonthlyTrend } from "@/lib/data";
import { fetchNPSDataFromSheets } from "@/lib/googleSheetsApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/LoadingState";
import { useQuery } from "@tanstack/react-query";
import { ValidationError } from "@/components/ValidationError";
import { BarChart2, ChevronDown, Filter, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NPSChart() {
  const [activeTab, setActiveTab] = useState("distribution");
  const { toast } = useToast();
  
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
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Leads</CardTitle>
          <p className="text-sm text-muted-foreground">8,203 Total leads / 3,587 bad leads</p>
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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  return [value, name === 'totalLeads' ? 'Total Leads' : 'Bad Leads'];
                }}
              />
              <Legend />
              <Bar dataKey="totalLeads" stackId="a" fill="#e0e0e0" name="Total Leads" />
              <Bar dataKey="badLeads" stackId="a" fill="#8884d8" name="Bad Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
