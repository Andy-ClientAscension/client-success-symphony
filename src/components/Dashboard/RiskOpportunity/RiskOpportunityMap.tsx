
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Legend,
  ReferenceLine
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
        <div className="bg-background border rounded-md p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{data.name}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <p className="text-muted-foreground">Churn Risk:</p>
            <p className="font-medium text-right">{data.x}%</p>
            <p className="text-muted-foreground">Growth Potential:</p>
            <p className="font-medium text-right">{data.y}%</p>
          </div>
          <div className="mt-2 pt-2 border-t text-xs font-medium">
            {data.recommendedAction}
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Define quadrant labels
  const QuadrantLabel = ({ x, y, text }: { x: number, y: number, text: string }) => {
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={11}
        fontWeight={500}
        opacity={0.8}
      >
        {text}
      </text>
    );
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
                bottom: 40,
                left: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              
              {/* Reference lines to divide quadrants */}
              <ReferenceLine 
                x={50} 
                stroke="#94a3b8" 
                strokeWidth={1.5}
                strokeDasharray="5 5" 
              />
              <ReferenceLine 
                y={50} 
                stroke="#94a3b8" 
                strokeWidth={1.5}
                strokeDasharray="5 5" 
              />
              
              {/* Quadrant labels */}
              <QuadrantLabel x={25} y={25} text="Low Risk, Low Growth" />
              <QuadrantLabel x={75} y={25} text="High Risk, Low Growth" />
              <QuadrantLabel x={25} y={75} text="Low Risk, High Growth" />
              <QuadrantLabel x={75} y={75} text="High Risk, High Growth" />
              
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Churn Risk" 
                domain={[0, 100]} 
                label={{ 
                  value: 'Churn Risk (%)', 
                  position: 'bottom',
                  style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 }
                }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Growth Potential" 
                domain={[0, 100]} 
                label={{ 
                  value: 'Growth Potential (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 }
                }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <ZAxis type="number" dataKey="z" range={[60, 60]} />
              <Tooltip content={<CustomTooltip />} />
              
              <Scatter 
                name="High Risk, High Growth" 
                data={highRiskHighGrowth} 
                fill="#f97316" 
                shape="triangle" 
              />
              <Scatter 
                name="High Risk, Low Growth" 
                data={highRiskLowGrowth} 
                fill="#ef4444" 
                shape="circle" 
              />
              <Scatter 
                name="Low Risk, High Growth" 
                data={lowRiskHighGrowth} 
                fill="#22c55e" 
                shape="diamond" 
              />
              <Scatter 
                name="Low Risk, Low Growth" 
                data={lowRiskLowGrowth} 
                fill="#64748b" 
                shape="square" 
              />
              
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconSize={10}
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center border border-muted">
            <div className="rounded-full bg-red-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">High Risk, Low Growth</p>
            <p className="text-xs text-muted-foreground">Intervention Needed</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center border border-muted">
            <div className="rounded-full bg-orange-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">High Risk, High Growth</p>
            <p className="text-xs text-muted-foreground">Stabilize & Grow</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center border border-muted">
            <div className="rounded-full bg-green-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">Low Risk, High Growth</p>
            <p className="text-xs text-muted-foreground">Invest & Expand</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center border border-muted">
            <div className="rounded-full bg-slate-500 w-3 h-3 mb-2" />
            <p className="text-xs font-medium">Low Risk, Low Growth</p>
            <p className="text-xs text-muted-foreground">Maintain & Monitor</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
