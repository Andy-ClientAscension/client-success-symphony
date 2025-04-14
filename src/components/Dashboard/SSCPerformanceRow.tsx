
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client } from "@/lib/data";
import { Award, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SSCPerformanceRowProps {
  csm: string;
  clients: Client[];
  isMobile?: boolean;
  onDelete?: (csm: string) => void;
}

export function SSCPerformanceRow({ csm, clients, isMobile = false, onDelete }: SSCPerformanceRowProps) {
  // Filter clients for this CSM
  const csmClients = clients.filter(client => client.csm === csm);
  
  // Calculate backend students with safe access
  const backendStudents = csmClients.reduce((total, client) => {
    // Access with optional chaining and fallback to 0 if undefined
    return total + (client.backendStudents || 0);
  }, 0);
  
  // Calculate average NPS with improved null handling
  let totalNPS = 0;
  let npsCount = 0;
  
  csmClients.forEach(client => {
    if (client.npsScore !== null && client.npsScore !== undefined && !isNaN(client.npsScore)) {
      totalNPS += client.npsScore;
      npsCount++;
    }
  });
  
  const avgNPS = npsCount > 0 ? Math.round(totalNPS / npsCount) : "-";
  
  // Calculate average retention with null handling for status
  const activeClients = csmClients.filter(client => 
    client.status === 'active' || client.status === 'new'
  ).length;
  
  const totalClientsWithStatus = csmClients.filter(client => 
    client.status === 'active' || client.status === 'new' || 
    client.status === 'at-risk' || client.status === 'churned'
  ).length;
  
  const retentionRate = totalClientsWithStatus > 0 
    ? Math.round((activeClients / totalClientsWithStatus) * 100) 
    : 0;
  
  // Calculate MRR with null handling
  const totalMRR = csmClients.reduce((total, client) => {
    const clientMRR = client.mrr || 0;
    // Verify MRR is a valid number
    return total + (isNaN(clientMRR) ? 0 : clientMRR);
  }, 0);
  
  // Calculate growth metrics with improved null handling
  const growthMetric = csmClients.reduce((total, client) => {
    // Access with optional chaining and fallback to 0 if undefined or NaN
    const growth = client.growth || 0;
    return total + (isNaN(growth) ? 0 : growth);
  }, 0);
  
  // Calculate health grade with better validation
  // 30% NPS + 30% Retention + 20% Growth + 20% MRR trends
  let healthScore = 0;
  
  // NPS component (30%)
  if (npsCount > 0) {
    // Normalize NPS from 0-10 scale to 0-100 scale
    const normalizedNPS = Math.min(100, Math.max(0, (totalNPS / npsCount) * 10));
    healthScore += normalizedNPS * 0.3;
  }
  
  // Retention component (30%)
  healthScore += Math.min(100, Math.max(0, retentionRate)) * 0.3;
  
  // Growth component (20%) - improved calculation
  const growthScore = Math.min(100, Math.max(0, 
    (growthMetric / Math.max(1, csmClients.length)) * 20
  ));
  healthScore += growthScore * 0.2;
  
  // MRR trends component (20%) - improved calculation
  const mrrScore = Math.min(100, Math.max(0, (totalMRR / 10000) * 100));
  healthScore += mrrScore * 0.2;
  
  // Ensure health score is within bounds
  healthScore = Math.min(100, Math.max(0, healthScore));
  
  // Convert health score to letter grade
  let grade;
  let color;
  
  if (healthScore >= 97) { grade = "A+"; color = "text-green-600 dark:text-green-400"; }
  else if (healthScore >= 93) { grade = "A"; color = "text-green-600 dark:text-green-400"; }
  else if (healthScore >= 90) { grade = "A-"; color = "text-green-600 dark:text-green-400"; }
  else if (healthScore >= 87) { grade = "B+"; color = "text-green-500 dark:text-green-400"; }
  else if (healthScore >= 83) { grade = "B"; color = "text-green-500 dark:text-green-400"; }
  else if (healthScore >= 80) { grade = "B-"; color = "text-green-500 dark:text-green-400"; }
  else if (healthScore >= 77) { grade = "C+"; color = "text-amber-500 dark:text-amber-400"; }
  else if (healthScore >= 73) { grade = "C"; color = "text-amber-500 dark:text-amber-400"; }
  else if (healthScore >= 70) { grade = "C-"; color = "text-amber-500 dark:text-amber-400"; }
  else if (healthScore >= 67) { grade = "D+"; color = "text-red-500 dark:text-red-400"; }
  else if (healthScore >= 63) { grade = "D"; color = "text-red-500 dark:text-red-400"; }
  else if (healthScore >= 60) { grade = "D-"; color = "text-red-500 dark:text-red-400"; }
  else { grade = "F"; color = "text-red-600 dark:text-red-400"; }
  
  return (
    <TableRow className="hover:bg-muted/50 dark:hover:bg-gray-800/50">
      <TableCell className="font-medium py-3">{csm}</TableCell>
      <TableCell className="text-center">{csmClients.length}</TableCell>
      {!isMobile && <TableCell className="text-center">{backendStudents}</TableCell>}
      <TableCell>
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center min-w-[80px]">
            <Award className={`h-4 w-4 mr-1.5 ${color}`} />
            <span className={`font-medium ${color}`}>Grade: {grade}</span>
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'items-center space-x-3'} text-sm text-gray-600 dark:text-gray-300`}>
            <span>NPS: {avgNPS}</span>
            <span>Retention: {retentionRate}%</span>
            <span>${totalMRR.toLocaleString()}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
          onClick={() => onDelete && onDelete(csm)}
          title="Delete account"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
