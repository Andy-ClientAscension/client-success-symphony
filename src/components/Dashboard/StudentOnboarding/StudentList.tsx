import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "@/lib/data";
import { MoreHorizontal, Search, Mail, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentListProps {
  students: Client[];
  showActions?: boolean;
  compact?: boolean;
}

export function StudentList({ students, showActions = true, compact = false }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.service?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'at-risk': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'graduated': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'paused': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getHealthScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score < 50) return 'bg-red-100 text-red-800';
    if (score < 70) return 'bg-orange-100 text-orange-800';
    if (score < 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleAction = (action: string, student: Client) => {
    toast({
      title: `${action} Action`,
      description: `${action} action for ${student.name}`,
    });
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredStudents.slice(0, 5).map((student) => (
          <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.service}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(student.status)}>
                {student.status}
              </Badge>
              {student.health_score && (
                <Badge className={getHealthScoreColor(student.health_score)}>
                  {student.health_score}
                </Badge>
              )}
            </div>
          </div>
        ))}
        {filteredStudents.length > 5 && (
          <p className="text-center text-sm text-muted-foreground">
            +{filteredStudents.length - 5} more students
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Start Date</TableHead>
              {showActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {student.id.slice(-8)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {student.email && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{student.service || 'General Program'}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {student.contract_type && (
                      <div className="text-sm font-medium">{student.contract_type}</div>
                    )}
                    {student.contract_duration_months && (
                      <div className="text-xs text-muted-foreground">
                        {student.contract_duration_months} month{student.contract_duration_months !== 1 ? 's' : ''}
                      </div>
                    )}
                    {!student.contract_type && !student.contract_duration_months && (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{student.team || 'Default'}</span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {student.health_score ? (
                    <Badge className={getHealthScoreColor(student.health_score)}>
                      {student.health_score}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{student.startDate}</span>
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('View', student)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Edit', student)}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Contact', student)}>
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Update Status', student)}>
                          Update Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No students found matching your search.</p>
        </div>
      )}
    </div>
  );
}