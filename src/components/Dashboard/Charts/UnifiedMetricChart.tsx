import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export interface MetricChartProps {
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color: string;
  yAxisDomain?: [number, number];
  referenceValue?: number;
  valueFormatter?: (value: number) => string;
  yAxisLabel?: string;
  subtitle?: string;
  height?: number;
  className?: string;
}

export function UnifiedMetricChart({
  title,
  data,
  dataKey,
  xAxisKey,
  color,
  yAxisDomain,
  referenceValue,
  valueFormatter,
  yAxisLabel,
  subtitle,
  height = 240,
  className = ""
}: MetricChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasData = data && data.length > 0;

  return (
    <Card className={className}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {hasData ? (
              <TimeSeriesChart
                title={title}
                data={data}
                dataKey={dataKey}
                xAxisKey={xAxisKey}
                color={color}
                yAxisDomain={yAxisDomain}
                referenceValue={referenceValue}
                valueFormatter={valueFormatter}
                yAxisLabel={yAxisLabel}
                height={height}
              />
            ) : (
              <EmptyState
                title="No Data Available"
                message="Start tracking metrics to see trends over time."
                icon={<ChevronDown className="h-8 w-8 text-muted-foreground" />}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Preset configurations for common metrics
export function NPSMetricChart({ className = "" }: { className?: string }) {
  const data = [
    { month: "Jan", score: 8.2 },
    { month: "Feb", score: 7.9 },
    { month: "Mar", score: 8.5 },
    { month: "Apr", score: 8.1 },
    { month: "May", score: 8.4 },
    { month: "Jun", score: 8.7 }
  ];

  return (
    <UnifiedMetricChart
      title="NPS Score Trend"
      data={data}
      dataKey="score"
      xAxisKey="month"
      color="#4ade80"
      yAxisDomain={[0, 10]}
      valueFormatter={(value) => value.toFixed(1)}
      yAxisLabel="NPS Score"
      className={className}
    />
  );
}

export function ChurnMetricChart({ className = "" }: { className?: string }) {
  const data = [
    { month: "Jan", rate: 2.1 },
    { month: "Feb", rate: 1.8 },
    { month: "Mar", rate: 2.3 },
    { month: "Apr", rate: 1.9 },
    { month: "May", rate: 2.2 },
    { month: "Jun", rate: 1.7 }
  ];

  return (
    <UnifiedMetricChart
      title="Company Churn Rate"
      data={data}
      dataKey="rate"
      xAxisKey="month"
      color="#f87171"
      yAxisDomain={[0, 5]}
      referenceValue={2.0}
      valueFormatter={(value) => `${value}%`}
      yAxisLabel="Churn Rate (%)"
      className={className}
    />
  );
}
