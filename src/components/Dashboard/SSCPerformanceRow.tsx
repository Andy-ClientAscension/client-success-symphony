
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client } from "@/lib/data";
import { Award } from "lucide-react";

interface SSCPerformanceRowProps {
  csm: string;
  clients: Client[];
  isMobile?: boolean;
}

export function SSCPerformanceRow({ csm, clients, isMobile = false }: SSCPerformanceRowProps) {
  // Filter clients for this CSM
  const csmClients = clients.filter(client => client.csm === csm);
  
  // Calculate backend students
  const backendStudents = csmClients.reduce((total, client) => {
    return total + (client.backendStudents || 0);
  }, 0);
  
  // Calculate average NPS
  let totalNPS = 0;
  let npsCount = 0;
  
  csmClients.forEach(client => {
    if (client.npsScore) {
      totalNPS += client.npsScore;
      npsCount++;
    }
  });
  
  const avgNPS = npsCount > 0 ? Math.round(totalNPS / npsCount) : "-";
  
  // Calculate average retention
  const activeClients = csmClients.filter(client => client.status === 'active').length;
  const retentionRate = csmClients.length > 0 
    ? Math.round((activeClients / csmClients.length) * 100) 
    : 0;
  
  // Calculate MRR
  const totalMRR = csmClients.reduce((total, client) => {
    return total + (client.mrr || 0);
  }, 0);
  
  // Calculate growth metrics
  const growthMetric = csmClients.reduce((total, client) => {
    return total + (client.growth || 0);
  }, 0);
  
  // Calculate health grade
  // 30% NPS + 30% Retention + 20% Growth + 20% MRR trends
  let healthScore = 0;
  
  // NPS component (30%)
  if (npsCount > 0) {
    // Normalize NPS from -100 to 100 scale to 0-100 scale
    const normalizedNPS = ((totalNPS / npsCount) + 100) / 2;
    healthScore += normalizedNPS * 0.3;
  }
  
  // Retention component (30%)
  healthScore += retentionRate * 0.3;
  
  // Growth component (20%) - simplified calculation
  const growthScore = Math.min(100, (growthMetric / csmClients.length) * 20);
  healthScore += growthScore * 0.2;
  
  // MRR trends component (20%) - simplified calculation
  const mrrScore = Math.min(100, (totalMRR / 10000) * 100);
  healthScore += mrrScore * 0.2;
  
  // Convert health score to letter grade
  let grade;
  let color;
  
  if (healthScore >= 97) { grade = "A+"; color = "text-green-600"; }
  else if (healthScore >= 93) { grade = "A"; color = "text-green-600"; }
  else if (healthScore >= 90) { grade = "A-"; color = "text-green-600"; }
  else if (healthScore >= 87) { grade = "B+"; color = "text-green-500"; }
  else if (healthScore >= 83) { grade = "B"; color = "text-green-500"; }
  else if (healthScore >= 80) { grade = "B-"; color = "text-green-500"; }
  else if (healthScore >= 77) { grade = "C+"; color = "text-amber-500"; }
  else if (healthScore >= 73) { grade = "C"; color = "text-amber-500"; }
  else if (healthScore >= 70) { grade = "C-"; color = "text-amber-500"; }
  else if (healthScore >= 67) { grade = "D+"; color = "text-red-500"; }
  else if (healthScore >= 63) { grade = "D"; color = "text-red-500"; }
  else if (healthScore >= 60) { grade = "D-"; color = "text-red-500"; }
  else { grade = "F"; color = "text-red-600"; }
  
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium py-3">{csm}</TableCell>
      <TableCell className="text-center">{csmClients.length}</TableCell>
      {!isMobile && <TableCell className="text-center">{backendStudents}</TableCell>}
      <TableCell>
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center min-w-[80px]">
            <Award className={`h-4 w-4 mr-1.5 ${color}`} />
            <span className={`font-medium ${color}`}>Grade: {grade}</span>
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'items-center space-x-3'} text-sm text-gray-600`}>
            <span>NPS: {avgNPS}</span>
            <span>Retention: {retentionRate}%</span>
            <span>${totalMRR.toLocaleString()}</span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
