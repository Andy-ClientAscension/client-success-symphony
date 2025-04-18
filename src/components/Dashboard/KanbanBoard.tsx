
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanSquare, Plus, MoreVertical, Calendar, Users, MessageSquare, AlertTriangle, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { StudentDateModal } from "./StudentDateModal";
import { StudentNotes } from "./StudentNotes";
import { StudentPaymentAlert } from "./StudentPaymentAlert";
import { StudentTeamEdit } from "./StudentTeamEdit";
import { checkStudentPaymentStatus } from "@/lib/payment-monitor";
import { CSM_TEAMS } from "@/lib/data";
import { useKanbanStore, Student } from "@/utils/kanbanStore";
import { getDefaultColumnOrder } from "./KanbanView/ClientStatusHelper";

export function KanbanBoard() {
  const {
    data,
    filteredData,
    selectedTeam,
    setSelectedTeam,
    moveStudent,
    addChurnDate,
    addNote,
    updateStudentTeam,
    loadPersistedData
  } = useKanbanStore();
  
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dateModalType, setDateModalType] = useState<"churn" | "other">("churn");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [teamEditOpen, setTeamEditOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      loadPersistedData();
      
      const checkAllStudentPayments = async () => {
        if (!data || !data.students) {
          console.warn("Student data not available for payment check");
          return;
        }
        
        const updatedStudents = { ...data.students };
        let hasPaymentIssues = false;
        
        for (const studentId in updatedStudents) {
          const student = updatedStudents[studentId];
          if (data.columns && (
              data.columns.active?.studentIds.includes(studentId) || 
              data.columns.backend?.studentIds.includes(studentId) ||
              data.columns.olympia?.studentIds.includes(studentId))) {
            const paymentStatus = await checkStudentPaymentStatus(
              student.id, 
              student.name,
              28
            );
            
            if (paymentStatus.isOverdue) {
              hasPaymentIssues = true;
            }
          }
        }
        
        if (hasPaymentIssues) {
          toast({
            title: "Payment Alerts",
            description: "Some students have overdue payments",
            variant: "destructive",
          });
        }
      };
      
      checkAllStudentPayments().catch(err => {
        console.error("Error checking student payments:", err);
      });
    } catch (error) {
      console.error("Error in KanbanBoard initialization:", error);
    }
  }, []);
  
  const onDragEnd = (result) => {
    try {
      const { destination, source, draggableId } = result;
      
      if (!destination) {
        return;
      }
      
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }
      
      if (destination.droppableId === 'churned' && source.droppableId !== 'churned') {
        setSelectedStudent(data.students?.[draggableId]);
        setDateModalType("churn");
        setDateModalOpen(true);
      }
      
      moveStudent(
        draggableId, 
        source.droppableId, 
        destination.droppableId, 
        source.index, 
        destination.index
      );
    } catch (error) {
      console.error("Error in drag and drop operation:", error);
      toast({
        title: "Operation Failed",
        description: "There was an error moving the student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChurnDateConfirm = (date: Date) => {
    if (selectedStudent) {
      addChurnDate(selectedStudent.id, date);
      
      toast({
        title: "Churn Date Set",
        description: `${selectedStudent.name} marked as churned on ${format(date, 'MMMM d, yyyy')}.`,
      });
      
      if (filteredData && filteredData.columns) {
        const sourceColumn = filteredData.columnOrder.find(id => 
          filteredData.columns[id]?.studentIds?.includes(selectedStudent.id)
        );
        
        if (sourceColumn) {
          moveStudent(
            selectedStudent.id,
            sourceColumn,
            'churned',
            0,
            0
          );
        }
      }
    }
  };

  const handleViewDates = (student: Student) => {
    setSelectedStudent(student);
    setDateModalType("other");
    setDateModalOpen(true);
  };

  const handleAddNote = (studentId: string, note: any) => {
    addNote(studentId, note);
    
    toast({
      title: "Note Added",
      description: `Note added for ${data.students[studentId].name}.`,
    });
  };

  const handleEditTeam = (student: Student) => {
    setSelectedStudent(student);
    setTeamEditOpen(true);
  };

  const handleTeamChange = (teamId: string) => {
    if (!selectedStudent) return;
    
    updateStudentTeam(selectedStudent.id, teamId);
  };

  const formatDateInfo = (student: Student) => {
    if (student.startDate) {
      return (
        <div className="text-xs text-muted-foreground mt-1">
          {student.startDate && <div>Start: {format(new Date(student.startDate), 'MMM d, yyyy')}</div>}
          {student.endDate && <div>End: {format(new Date(student.endDate), 'MMM d, yyyy')}</div>}
          {student.churnDate && <div className="text-red-500">Churned: {format(new Date(student.churnDate), 'MMM d, yyyy')}</div>}
          {student.csm && (
            <div className="font-semibold mt-1">
              {CSM_TEAMS.find(team => team.id === student.csm)?.name || student.csm}
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  const teamStats = () => {
    try {
      if (!data || !data.students || !data.columns) {
        return {
          total: 0,
          active: 0,
          graduated: 0,
          churned: 0,
        };
      }
      
      if (selectedTeam === "all") {
        return {
          total: Object.keys(data.students).length,
          active: data.columns.active?.studentIds?.length || 0,
          graduated: data.columns.graduated?.studentIds?.length || 0,
          churned: data.columns.churned?.studentIds?.length || 0,
        };
      }
      
      const teamStudents = Object.values(data.students).filter(student => student.csm === selectedTeam);
      const teamIds = teamStudents.map(student => student.id);
      
      return {
        total: teamStudents.length,
        active: (data.columns.active?.studentIds || []).filter(id => teamIds.includes(id)).length,
        graduated: (data.columns.graduated?.studentIds || []).filter(id => teamIds.includes(id)).length,
        churned: (data.columns.churned?.studentIds || []).filter(id => teamIds.includes(id)).length,
      };
    } catch (error) {
      console.error("Error calculating team stats:", error);
      return { total: 0, active: 0, graduated: 0, churned: 0 };
    }
  };
  
  const stats = teamStats();
  
  if (!filteredData || !filteredData.columns || !filteredData.columnOrder) {
    return (
      <Card className="mt-4 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <KanbanSquare className="h-5 w-5 text-red-600" />
            <CardTitle>Student Tracking</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-red-600"></div>
            <div>Loading student data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-4 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <KanbanSquare className="h-5 w-5 text-red-600" />
          <CardTitle>Student Tracking</CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-red-600" />
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {CSM_TEAMS.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-1" /> Add Student
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {selectedTeam !== "all" && (
          <div className="mb-4 p-4 bg-slate-100 rounded-lg">
            <h3 className="font-medium text-lg mb-2">
              {CSM_TEAMS.find(team => team.id === selectedTeam)?.name} Stats
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Total Students</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Graduated</div>
                <div className="text-2xl font-bold text-blue-600">{stats.graduated}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Churned</div>
                <div className="text-2xl font-bold text-red-600">{stats.churned}</div>
              </div>
            </div>
          </div>
        )}
        
        <ScrollArea className="h-full max-h-[calc(100vh-250px)]">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-4 overflow-x-auto">
              {filteredData.columnOrder.map(columnId => {
                const column = filteredData.columns?.[columnId];
                if (!column) return null;
                
                const students = (column.studentIds || [])
                  .map(studentId => data.students?.[studentId])
                  .filter(Boolean) as Student[];
                
                return (
                  <div key={column.id} className="flex flex-col bg-secondary/50 rounded-lg p-3 min-w-[250px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h3 className="font-medium">{column.title}</h3>
                        <Badge variant="count" className="ml-2 px-2 flex-shrink-0">
                          {students.length}
                        </Badge>
                      </div>
                    </div>
                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 min-h-[200px] overflow-hidden"
                        >
                          {students.map((student, index) => (
                            <Draggable key={student.id} draggableId={student.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-2 bg-background rounded-md p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{student.name}</span>
                                    <div className="flex items-center">
                                      {(student.notes?.length || 0) > 0 && (
                                        <Badge 
                                          variant="outline" 
                                          className="mr-2 px-1.5 py-0.5 flex items-center border-red-200 bg-red-50"
                                        >
                                          <MessageSquare className="h-3 w-3 mr-1 text-red-600" />
                                          <span>{student.notes?.length}</span>
                                        </Badge>
                                      )}
                                      {student.paymentStatus?.isOverdue && (
                                        <Badge 
                                          variant="destructive" 
                                          className="mr-2 px-1.5 py-0.5 flex items-center"
                                        >
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          <span>Payment</span>
                                        </Badge>
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreVertical className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>View Details</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleViewDates(student)}>
                                            <Calendar className="h-3 w-3 mr-2" /> View Dates
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEditTeam(student)}>
                                            <UserCheck className="h-3 w-3 mr-2" /> Assign Team
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => setExpandedStudentId(
                                              expandedStudentId === student.id ? null : student.id
                                            )}
                                          >
                                            <MessageSquare className="h-3 w-3 mr-2" /> 
                                            {expandedStudentId === student.id ? "Hide Notes" : "Show Notes"}
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem>Edit Student</DropdownMenuItem>
                                          <DropdownMenuItem>Contact</DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs text-muted-foreground mb-1">Progress</div>
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${student.progress >= 70 ? 'bg-success-500' : student.progress >= 40 ? 'bg-warning-500' : 'bg-red-600'}`}
                                        style={{ width: `${student.progress}%` }} 
                                      />
                                    </div>
                                  </div>
                                  {formatDateInfo(student)}
                                  
                                  {student.paymentStatus?.isOverdue && (
                                    <StudentPaymentAlert paymentStatus={student.paymentStatus} />
                                  )}
                                  
                                  {expandedStudentId === student.id && (
                                    <StudentNotes
                                      studentId={student.id}
                                      studentName={student.name}
                                      notes={student.notes || []}
                                      onAddNote={handleAddNote}
                                    />
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </ScrollArea>
        
        {dateModalOpen && selectedStudent && (
          <StudentDateModal
            isOpen={dateModalOpen}
            onClose={() => setDateModalOpen(false)}
            onConfirm={dateModalType === "churn" ? handleChurnDateConfirm : () => {}}
            title={
              dateModalType === "churn" 
                ? `Set Churn Date for ${selectedStudent.name}` 
                : `Date Information for ${selectedStudent.name}`
            }
            defaultDate={
              dateModalType === "churn" 
                ? new Date() 
                : selectedStudent.churnDate 
                  ? new Date(selectedStudent.churnDate)
                  : new Date()
            }
          />
        )}

        {teamEditOpen && selectedStudent && (
          <StudentTeamEdit
            isOpen={teamEditOpen}
            onClose={() => setTeamEditOpen(false)}
            onSubmit={handleTeamChange}
            studentName={selectedStudent.name}
            studentId={selectedStudent.id}
            currentTeam={selectedStudent.csm}
          />
        )}
      </CardContent>
    </Card>
  );
}
