
import React from "react";
import { StatusDistribution } from "../Shared";
import { calculateStatusCounts, calculateRates } from "@/utils/analyticsUtils";
import { Client } from "@/lib/data";

interface StatusSummaryProps {
  clients: Client[];
  variant?: "compact" | "detailed";
}

export function StatusSummary({ clients, variant = "compact" }: StatusSummaryProps) {
  const statusCounts = calculateStatusCounts(clients);
  const rates = calculateRates(statusCounts);
  
  return (
    <div className="mb-4">
      <StatusDistribution 
        statusCounts={statusCounts}
        rates={rates}
        variant={variant}
        showTrends={false}
      />
    </div>
  );
}
