
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
    <tr
      className="hover:bg-muted/50 cursor-pointer transition-colors"
      style={style}
      onClick={() => onClick?.(client)}
      role="row"
      // Convert client.id to a number if it's a string with a number value, 
      // or use a numeric index or 0 as fallback
      aria-rowindex={Number(client.id) || 0}
    >
      {columns.map((column) => (
        <td
          key={`${client.id}-${column.key}`}
          className={`py-3 px-4 ${column.className || ''}`}
          role="cell"
        >
          {column.key === 'status' && client.status
            ? renderStatusWithChart(client.status)
            : column.cell?.(client)}
        </td>
      ))}
    </tr>
  );
}
