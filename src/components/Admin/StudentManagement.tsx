import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserCog, Edit2, Trash2, GraduationCap, ArrowRight } from "lucide-react";
import { getAllClients, Client } from "@/lib/data";

export function StudentManagement() {
  const [students, setStudents] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSSC, setSelectedSSC] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const { toast } = useToast();

  const mainSSCs = ["Andy", "Chris", "Cillin", "Nick", "Stephen"];
  const teams = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const clientsData = getAllClients();
      setStudents(clientsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const moveStudent = async (studentId: string, newSSC: string, newTeam?: string) => {
    try {
      const updateData: any = { assigned_ssc: newSSC };
      if (newTeam) updateData.team = newTeam;

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Student moved to ${newSSC}`
      });

      fetchStudents();
    } catch (error) {
      console.error('Error moving student:', error);
      toast({
        title: "Error",
        description: "Failed to move student",
        variant: "destructive"
      });
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully"
      });

      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive"
      });
    }
  };

  const updateStudentStatus = async (studentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student status updated"
      });

      fetchStudents();
    } catch (error) {
      console.error('Error updating student status:', error);
      toast({
        title: "Error",
        description: "Failed to update student status",
        variant: "destructive"
      });
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSSC = selectedSSC === "all" || 
                      (selectedSSC === "none" && !student.assigned_ssc && !student.csm) ||
                      student.assigned_ssc === selectedSSC ||
                      student.csm === selectedSSC;
    
    const matchesTeam = selectedTeam === "all" || student.team === selectedTeam;
    
    return matchesSearch && matchesSSC && matchesTeam;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'active': 'default',
      'new': 'secondary',
      'graduated': 'success',
      'at-risk': 'destructive',
      'inactive': 'outline'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>Loading students...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Management
          </CardTitle>
          <CardDescription>
            Move students between SSCs, update status, and manage enrollments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSSC} onValueChange={setSelectedSSC}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by SSC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SSCs</SelectItem>
                <SelectItem value="none">No SSC</SelectItem>
                {mainSSCs.map(ssc => (
                  <SelectItem key={ssc} value={ssc}>{ssc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SSC</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Contract Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        {student.email && (
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(student.status)}
                    </TableCell>
                    <TableCell>
                      {student.assigned_ssc || student.csm || (
                        <Badge variant="outline">No SSC</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.team || (
                        <Badge variant="outline">No Team</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(student.startDate).toLocaleDateString()} - {new Date(student.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Move Student</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Student</label>
                                <p className="text-sm text-muted-foreground">{student.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Current SSC</label>
                                <p className="text-sm text-muted-foreground">
                                  {student.assigned_ssc || student.csm || "No SSC assigned"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">New SSC</label>
                                <Select onValueChange={(value) => moveStudent(student.id, value, student.team)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select new SSC" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mainSSCs.map(ssc => (
                                      <SelectItem key={ssc} value={ssc}>{ssc}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Student Status</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Student</label>
                                <p className="text-sm text-muted-foreground">{student.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Current Status</label>
                                <div className="mt-1">
                                  {getStatusBadge(student.status)}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">New Status</label>
                                <Select onValueChange={(value) => updateStudentStatus(student.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                    <SelectItem value="at-risk">At Risk</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {student.name}? This action cannot be undone and will remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteStudent(student.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}