
import React from "react";
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

interface TimeSeriesChartProps {
  data: Array<{ [key: string]: any }>;
  title: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  yAxisDomain?: [number, number];
  referenceValue?: number;
  valueFormatter?: (value: number) => string;
  yAxisLabel?: string;
  height?: number;
}

export function TimeSeriesChart({
  data,
  title,
  dataKey,
  xAxisKey,
  color = "#8884d8",
  yAxisDomain,
  referenceValue,
  valueFormatter = (value) => `${value}`,
  yAxisLabel,
  height = 220
}: TimeSeriesChartProps) {
  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
          />
          <YAxis
            domain={yAxisDomain}
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
            label={yAxisLabel ? { 
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#64748b' }
            } : undefined}
          />
          <Tooltip 
            formatter={(value) => [valueFormatter(Number(value)), title]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "8px"
            }}
          />
          {referenceValue && (
            <ReferenceLine 
              y={referenceValue} 
              stroke="#94a3b8" 
              strokeDasharray="3 3" 
              label={{
                value: `Target: ${valueFormatter(referenceValue)}`,
                position: 'insideBottomRight',
                style: { fill: '#64748b', fontSize: 10 }
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
