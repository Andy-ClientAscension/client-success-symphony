
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client } from "@/lib/data";
import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react";

interface SSCPerformanceRowProps {
  csm: string;
  clients: Client[];
}

// Helper function to calculate team grade
const calculateTeamGrade = (
  npsScore: number, 
  retentionRate: number, 
  growthRate: number, 
  mrrChange: number
): { grade: string; color: string } => {
  // Calculate weighted score (adjust weights as needed)
  const weightedScore = 
    (npsScore / 10) * 0.3 + 
    (retentionRate / 100) * 0.3 + 
    Math.min(growthRate / 20, 1) * 0.2 + 
    Math.min(mrrChange / 15, 1) * 0.2;
  
  // Convert to letter grade
  if (weightedScore >= 0.9) return { grade: "A+", color: "text-emerald-600" };
  if (weightedScore >= 0.8) return { grade: "A", color: "text-green-600" };
  if (weightedScore >= 0.7) return { grade: "B+", color: "text-green-500" };
  if (weightedScore >= 0.6) return { grade: "B", color: "text-lime-600" };
  if (weightedScore >= 0.5) return { grade: "C+", color: "text-amber-500" };
  if (weightedScore >= 0.4) return { grade: "C", color: "text-amber-600" };
  if (weightedScore >= 0.3) return { grade: "D", color: "text-orange-600" };
  return { grade: "F", color: "text-red-600" };
};

// Helper to determine trend icon
const getTrendIndicator = (trend: number) => {
  if (trend > 3) return <TrendingUp className="h-4 w-4 ml-1 text-green-600" />;
  if (trend < -3) return <TrendingDown className="h-4 w-4 ml-1 text-red-600" />;
  return <Minus className="h-4 w-4 ml-1 text-amber-600" />;
};

export function SSCPerformanceRow({ csm, clients }: SSCPerformanceRowProps) {
  const csmClients = clients.filter(client => client.csm === csm);
  
  // For now, we'll assume all clients are backend students
  const backendStudents = csmClients.length;
  
  // Calculate NPS metrics
  const clientsWithNPS = csmClients.filter(client => client.npsScore !== null);
  const avgNPS = clientsWithNPS.length > 0 
    ? Math.round(clientsWithNPS.reduce((sum, client) => sum + (client.npsScore || 0), 0) / clientsWithNPS.length)
    : 0;
  
  // Calculate retention rate
  const activeClients = csmClients.filter(client => client.status === 'active').length;
  const retentionRate = csmClients.length > 0 
    ? Math.round((activeClients / csmClients.length) * 100) 
    : 0;
  
  // Calculate growth metrics (calls booked as a proxy for growth)
  const totalCallsBooked = csmClients.reduce((sum, client) => sum + client.callsBooked, 0);
  const growthRate = Math.round((totalCallsBooked / Math.max(csmClients.length, 1)) * 5); // Normalized growth score
  
  // Calculate MRR change (simplified simulation)
  const totalMRR = csmClients.reduce((sum, client) => sum + client.mrr, 0);
  const mrrPerClient = totalMRR / Math.max(csmClients.length, 1);
  // Simulate a trend between -10 and +15
  const mrrChange = Math.round((mrrPerClient / 100) * (Math.random() * 25 - 10));
  
  // Calculate team health grade
  const { grade, color } = calculateTeamGrade(avgNPS, retentionRate, growthRate, mrrChange);
  
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium py-4">{csm}</TableCell>
      <TableCell className="text-center">{csmClients.length}</TableCell>
      <TableCell className="text-center">{backendStudents}</TableCell>
      <TableCell>
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-[80px]">
            <Award className={`h-4 w-4 mr-1.5 ${color}`} />
            <span className={`font-medium ${color}`}>Grade: {grade}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span>NPS: {avgNPS}</span>
            <span>·</span>
            <span>Ret: {retentionRate}%</span>
            <span>·</span>
            <span className="flex items-center">
              Growth: {growthRate}
              {getTrendIndicator(mrrChange)}
            </span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
