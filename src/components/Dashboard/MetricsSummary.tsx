
import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MetricErrorFallback } from "@/components/Dashboard/Shared/MetricErrorFallback";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { ChurnMetricChart, NPSMetricChart } from "@/components/Dashboard/Charts/UnifiedMetricChart";

export function MetricsSummary() {
  return (
    <div className="grid gap-8 md:gap-10 mb-8 animate-fade-in">
      <section aria-labelledby="metrics-heading" className="p-4 md:p-6 rounded-lg border border-border/30 bg-card shadow-sm">
        <h2 id="metrics-heading" className="sr-only">Key Performance Metrics</h2>
        <MetricsCards />
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 space-y-0 mb-8">
        <ErrorBoundary
          fallback={<MetricErrorFallback 
            error={new Error("Failed to load NPS chart")} 
            resetErrorBoundary={() => {}} 
          />}
        >
          <section aria-labelledby="nps-chart-heading" className="bg-background rounded-lg border border-border/30 p-4 focus-visible:outline-none hover:shadow transition-shadow duration-150">
            <h2 id="nps-chart-heading" className="text-lg font-medium mb-4">NPS Metrics</h2>
            <NPSMetricChart />
          </section>
        </ErrorBoundary>
        <ErrorBoundary
          fallback={<MetricErrorFallback 
            error={new Error("Failed to load Churn chart")} 
            resetErrorBoundary={() => {}} 
          />}
        >
          <section aria-labelledby="churn-chart-heading" className="bg-background rounded-lg border border-border/30 p-4 focus-visible:outline-none hover:shadow transition-shadow duration-150">
            <h2 id="churn-chart-heading" className="text-lg font-medium mb-4">Churn Metrics</h2>
            <ChurnMetricChart />
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
}
