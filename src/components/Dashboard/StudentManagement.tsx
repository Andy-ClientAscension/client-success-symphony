
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, CheckCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Client } from "@/lib/data";

interface StudentManagementProps {
  clients: Client[];
}

export function StudentManagement({ clients }: StudentManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Filter students based on search query and selected status
  const filteredStudents = clients.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      false;
      
    const matchesStatus = selectedStatus ? student.status === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get count of at-risk students
  const atRiskCount = clients.filter(s => s.status === 'at-risk').length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedStatus ? `Status: ${selectedStatus}` : "Filter by Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedStatus(null)}>
                All Students
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("at-risk")}>
                At Risk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("churned")}>
                Churned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("new")}>
                New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {atRiskCount > 0 && (
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              {atRiskCount} at risk
            </Badge>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <StudentStatusBadge status={student.status} />
                    </TableCell>
                    <TableCell>
                      <HealthScore score={student.npsScore || 0} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={student.progress || 0} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          {student.progress || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {student.notes || "No notes available"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
    case 'at-risk':
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">At Risk</Badge>;
    case 'churned':
      return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Churned</Badge>;
    case 'new':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">New</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function HealthScore({ score }: { score: number }) {
  const getColorClass = () => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };
  
  return (
    <div className="flex items-center space-x-2">
      <span className={`font-medium ${getColorClass()}`}>{score}</span>
      {score >= 8 ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        score < 5 ? (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        ) : null
      )}
    </div>
  );
}
