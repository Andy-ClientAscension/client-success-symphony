
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientPrediction } from "@/hooks/use-ai-insights";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ZAxis,
  Legend
} from "recharts";
import { Info, AlertTriangle, TrendingUp } from "lucide-react";

interface RiskOpportunityMapProps {
  predictions: ClientPrediction[];
}

export function RiskOpportunityMap({ predictions }: RiskOpportunityMapProps) {
  // Transform data for the scatter plot
  const scatterData = predictions.map(prediction => ({
    name: prediction.name,
    id: prediction.id,
    x: prediction.churnRisk,     // X-axis: Churn Risk
    y: prediction.growthPotential, // Y-axis: Growth Potential
    z: 1, // Size is constant for now
    recommendedAction: prediction.recommendedAction
  }));
  
  // Separate data into quadrants for better visualization
  const highRiskHighGrowth = scatterData.filter(d => d.x > 50 && d.y > 50);
  const highRiskLowGrowth = scatterData.filter(d => d.x > 50 && d.y <= 50);
  const lowRiskHighGrowth = scatterData.filter(d => d.x <= 50 && d.y > 50);
  const lowRiskLowGrowth = scatterData.filter(d => d.x <= 50 && d.y <= 50);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded p-3 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Churn Risk: {data.x}%</p>
          <p className="text-xs text-muted-foreground">Growth Potential: {data.y}%</p>
          <p className="text-xs font-medium mt-1">{data.recommendedAction}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Risk & Opportunity Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Churn Risk" 
                domain={[0, 100]} 
                label={{ 
                  value: 'Churn Risk (%)', 
                  position: 'bottom' 
                }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Growth Potential" 
                domain={[0, 100]} 
                label={{ 
                  value: 'Growth Potential (%)', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 100]} />
              <Tooltip content={<CustomTooltip />} />
              
              <Scatter name="High Risk, High Growth" data={highRiskHighGrowth} fill="#f97316" shape="triangle" />
              <Scatter name="High Risk, Low Growth" data={highRiskLowGrowth} fill="#ef4444" />
              <Scatter name="Low Risk, High Growth" data={lowRiskHighGrowth} fill="#22c55e" />
              <Scatter name="Low Risk, Low Growth" data={lowRiskLowGrowth} fill="#64748b" />
              
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <div className="bg-muted/50 p-3 rounded flex flex-col items-center">
            <div className="rounded-full bg-red-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">High Risk, Low Growth</p>
            <p className="text-xs text-muted-foreground">Intervention Needed</p>
          </div>
          
          <div className="bg-muted/50 p-3 rounded flex flex-col items-center">
            <div className="rounded-full bg-orange-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">High Risk, High Growth</p>
            <p className="text-xs text-muted-foreground">Stabilize & Grow</p>
          </div>
          
          <div className="bg-muted/50 p-3 rounded flex flex-col items-center">
            <div className="rounded-full bg-green-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">Low Risk, High Growth</p>
            <p className="text-xs text-muted-foreground">Invest & Expand</p>
          </div>
          
          <div className="bg-muted/50 p-3 rounded flex flex-col items-center">
            <div className="rounded-full bg-slate-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">Low Risk, Low Growth</p>
            <p className="text-xs text-muted-foreground">Maintain & Monitor</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
