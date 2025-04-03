
import React from "react";
import { Client } from "@/lib/data";

interface ClientProgressSectionProps {
  client: Client;
}

export function ClientProgressSection({ client }: ClientProgressSectionProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success-500';
    if (progress >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
  };
  
  const getNPSColor = (score: number | null) => {
    if (score === null) return '';
    if (score >= 8) return 'text-success-600';
    if (score >= 6) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <div className="flex items-center gap-2">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(client.progress)}`} 
              style={{ width: `${client.progress}%` }} 
            />
          </div>
          <span className="text-sm font-medium">{client.progress}%</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">NPS Score</span>
        <span className={`text-2xl font-bold ${getNPSColor(client.npsScore)}`}>
          {client.npsScore !== null ? client.npsScore : 'N/A'}
        </span>
      </div>
    </div>
  );
}
