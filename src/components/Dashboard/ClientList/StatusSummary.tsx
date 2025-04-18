
import React from "react";
import { StatusDistribution } from "../Shared";
import { calculateStatusCounts, calculateRates } from "@/utils/analyticsUtils";
import { Client } from "@/lib/data";
import { StyledCard } from "../Shared/CardStyle";

interface StatusSummaryProps {
  clients: Client[];
  variant?: "compact" | "detailed";
}

export function StatusSummary({ clients, variant = "compact" }: StatusSummaryProps) {
  const statusCounts = calculateStatusCounts(clients);
  const rates = calculateRates(statusCounts);
  
  return (
    <StyledCard 
      variant="info" 
      className="mb-4 border"
      contentClassName="p-3"
    >
      <StatusDistribution 
        statusCounts={statusCounts}
        rates={rates}
        variant={variant}
        showTrends={false}
      />
    </StyledCard>
  );
}
