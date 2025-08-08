
import React from "react";
import { Client } from "@/lib/data";
import { PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

// Status color mapping for the mini charts
const STATUS_COLORS = {
  active: "#10b981", // green
  "at-risk": "#f59e0b", // amber
  churned: "#ef4444", // red
  new: "#3b82f6", // blue
};

interface VirtualizedClientRowProps {
  client: Client;
  columns: any[];
  style: React.CSSProperties;
  onClick?: (client: Client) => void;
}

export function VirtualizedClientRow({ 
  client, 
  columns, 
  style,
  onClick 
}: VirtualizedClientRowProps) {
  if (!client) return null;
  
  // Helper function to render status with mini chart
  const renderStatusWithChart = (status: string) => {
    // Prepare data for the mini chart - showing status distribution
    const data = [
      { name: "Status", value: 1 }
    ];
    
    return (
      <div className="flex items-center gap-2">
        <PieChart width={24} height={24}>
          <Pie
            data={data}
            cx={12}
            cy={12}
            innerRadius={5}
            outerRadius={10}
            fill={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#888"}
            dataKey="value"
          />
        </PieChart>
        <Badge 
          variant={
            status === 'active' ? 'success' :
            status === 'at-risk' ? 'warning' :
            status === 'churned' ? 'danger' :
            'default'
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
    );
  };
  
  return (
    <div
      className="grid grid-cols-[40px_1fr_120px_200px] gap-4 py-3 px-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50"
      style={style}
      onClick={() => onClick?.(client)}
      role="row"
      aria-rowindex={Number(client.id) || 0}
    >
      {columns.map((column) => (
        <div
          key={`${client.id}-${column.key}`}
          className={`flex items-center ${column.className || ''}`}
          role="cell"
        >
          {column.key === 'status' && client.status
            ? renderStatusWithChart(client.status)
            : column.cell?.(client)}
        </div>
      ))}
    </div>
  );
}
