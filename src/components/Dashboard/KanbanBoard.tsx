import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanSquare, Plus, MoreVertical, Calendar, Users, MessageSquare, AlertTriangle, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, addMonths, addYears, differenceInDays } from "date-fns";
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
import { checkStudentPaymentStatus, PaymentStatus } from "@/lib/payment-monitor";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";
import { CSM_TEAMS } from "@/lib/data";

// Note type for student comments
interface Note {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  mentions?: string[];
}

// Enhanced student type with dates, CSM and notes
interface Student {
  id: string;
  name: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  contractDuration?: "6months" | "1year";
  churnDate?: string;
  csm?: string;
  notes?: Note[];
  paymentStatus?: PaymentStatus;
}

// Mock data for student tracking, adding CSM information and notes
const INITIAL_DATA = {
  columns: {
    'active': {
      id: 'active',
      title: 'Active Students',
      studentIds: ['s1', 's2', 's3']
    },
    'backend': {
      id: 'backend',
      title: 'Backend Students',
      studentIds: ['s4', 's5']
    },
    'olympia': {
      id: 'olympia',
      title: 'Olympia Students',
      studentIds: ['s6']
    },
    'churned': {
      id: 'churned',
      title: 'Churned Students',
      studentIds: ['s7']
    },
    'graduated': {
      id: 'graduated',
      title: 'Graduated Students',
      studentIds: ['s8', 's9']
    }
  },
  students: {
    's1': { 
      id: 's1', 
      name: 'Alice Johnson', 
      progress: 75, 
      startDate: format(new Date(2023, 5, 15), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(addMonths(new Date(2023, 5, 15), 6), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: [
        {
          id: 'n1',
          text: 'Alice is making great progress with the frontend module.',
          author: 'Sarah',
          timestamp: format(new Date(2023, 6, 10), 'yyyy-MM-dd HH:mm:ss')
        }
      ]
    },
    's2': { 
      id: 's2', 
      name: 'Bob Smith', 
      progress: 60,
      startDate: format(new Date(2023, 8, 10), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(addYears(new Date(2023, 8, 10), 1), 'yyyy-MM-dd'),
      csm: "Team-Chris",
      notes: [
        {
          id: 'n2',
          text: 'Bob might need help with React hooks. @michael please check in with him.',
          author: 'David',
          timestamp: format(new Date(2023, 9, 5), 'yyyy-MM-dd HH:mm:ss'),
          mentions: ['michael']
        }
      ]
    },
    's3': { 
      id: 's3', 
      name: 'Carol Davis', 
      progress: 80,
      startDate: format(new Date(2023, 10, 5), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(addMonths(new Date(2023, 10, 5), 6), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: []
    },
    's4': { 
      id: 's4', 
      name: 'Dave Wilson', 
      progress: 45,
      startDate: format(new Date(2023, 3, 12), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(addMonths(new Date(2023, 3, 12), 6), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: []
    },
    's5': { 
      id: 's5', 
      name: 'Eve Brown', 
      progress: 50,
      startDate: format(new Date(2023, 7, 20), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(addYears(new Date(2023, 7, 20), 1), 'yyyy-MM-dd'),
      csm: "Team-Chris",
      notes: []
    },
    's6': { 
      id: 's6', 
      name: 'Frank Miller', 
      progress: 70,
      startDate: format(new Date(2023, 9, 3), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(addYears(new Date(2023, 9, 3), 1), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: []
    },
    's7': { 
      id: 's7', 
      name: 'Grace Lee', 
      progress: 30,
      startDate: format(new Date(2023, 2, 8), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(addMonths(new Date(2023, 2, 8), 6), 'yyyy-MM-dd'),
      churnDate: format(new Date(2023, 4, 15), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: []
    },
    's8': { 
      id: 's8', 
      name: 'Henry Taylor', 
      progress: 100,
      startDate: format(new Date(2023, 0, 15), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(addMonths(new Date(2023, 0, 15), 6), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: []
    },
    's9': { 
      id: 's9', 
      name: 'Ivy Robinson', 
      progress: 100,
      startDate: format(new Date(2023, 1, 22), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(addYears(new Date(2023, 1, 22), 1), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: []
    }
  },
  columnOrder: ['active', 'backend', 'olympia', 'churned', 'graduated']
};

export function KanbanBoard() {
  const [data, setData] = useState(INITIAL_DATA);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dateModalType, setDateModalType] = useState<"churn" | "other">("churn");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [filteredData, setFilteredData] = useState(INITIAL_DATA);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [teamEditOpen, setTeamEditOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      const savedData = loadData(STORAGE_KEYS.KANBAN, INITIAL_DATA);
      setData(savedData);
    }
  }, []);
  
  useEffect(() => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled && data !== INITIAL_DATA) {
      saveData(STORAGE_KEYS.KANBAN, data);
      
      if (Math.random() < 0.2) {
        toast({
          title: "Changes Saved",
          description: "Your student tracking board has been saved",
        });
      }
    }
  }, [data]);
  
  useEffect(() => {
    const checkAllStudentPayments = async () => {
      const updatedStudents = { ...data.students };
      let hasPaymentIssues = false;
      
      for (const studentId in updatedStudents) {
        const student = updatedStudents[studentId];
        if (data.columns.active.studentIds.includes(studentId) || 
            data.columns.backend.studentIds.includes(studentId) ||
            data.columns.olympia.studentIds.includes(studentId)) {
          const paymentStatus = await checkStudentPaymentStatus(
            student.id, 
            student.name,
            28
          );
          
          if (paymentStatus.isOverdue) {
            hasPaymentIssues = true;
          }
          
          updatedStudents[studentId] = {
            ...student,
            paymentStatus
          };
        }
      }
      
      setData(prevData => ({
        ...prevData,
        students: updatedStudents
      }));
      
      if (hasPaymentIssues) {
        toast({
          title: "Payment Alerts",
          description: "Some students have overdue payments",
          variant: "destructive",
        });
      }
    };
    
    checkAllStudentPayments();
    
    const intervalId = setInterval(checkAllStudentPayments, 12 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    if (selectedTeam === "all") {
      setFilteredData(data);
      return;
    }
    
    const newData = { ...data };
    const filteredStudentIds = Object.keys(data.students).filter(
      id => data.students[id].csm === selectedTeam
    );
    
    Object.keys(newData.columns).forEach(columnId => {
      newData.columns[columnId] = {
        ...data.columns[columnId],
        studentIds: data.columns[columnId].studentIds.filter(
          id => filteredStudentIds.includes(id)
        )
      };
    });
    
    setFilteredData(newData);
  }, [selectedTeam, data]);
  
  useEffect(() => {
    const today = new Date();
    const updatedData = { ...data };
    let hasChanges = false;

    Object.keys(data.students).forEach(studentId => {
      const student = data.students[studentId];
      if (student.endDate && !student.churnDate) {
        const endDate = new Date(student.endDate);
        if (endDate <= today) {
          if (
            data.columns.active.studentIds.includes(studentId) && 
            !data.columns.backend.studentIds.includes(studentId)
          ) {
            updatedData.columns.active.studentIds = 
              updatedData.columns.active.studentIds.filter(id => id !== studentId);
            
            updatedData.columns.backend.studentIds.push(studentId);
            
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      setData(updatedData);
      toast({
        title: "Students Moved",
        description: "Students with expired contracts have been moved to Backend.",
      });
    }
  }, [data.students]);
  
  const onDragEnd = (result) => {
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
      setSelectedStudent(data.students[draggableId]);
      setDateModalType("churn");
      setDateModalOpen(true);
    }
    
    if (destination.droppableId === source.droppableId) {
      const column = data.columns[source.droppableId];
      const newStudentIds = Array.from(column.studentIds);
      newStudentIds.splice(source.index, 1);
      newStudentIds.splice(destination.index, 0, draggableId);
      
      const newColumn = {
        ...column,
        studentIds: newStudentIds
      };
      
      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn
        }
      });
      
      return;
    }
    
    const sourceColumn = data.columns[source.droppableId];
    const destinationColumn = data.columns[destination.droppableId];
    const sourceStudentIds = Array.from(sourceColumn.studentIds);
    const destStudentIds = Array.from(destinationColumn.studentIds);
    
    sourceStudentIds.splice(source.index, 1);
    destStudentIds.splice(destination.index, 0, draggableId);
    
    const newSourceColumn = {
      ...sourceColumn,
      studentIds: sourceStudentIds
    };
    
    const newDestColumn = {
      ...destinationColumn,
      studentIds: destStudentIds
    };
    
    setData({
      ...data,
      columns: {
        ...data.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestColumn.id]: newDestColumn
      }
    });
  };

  const handleChurnDateConfirm = (date: Date) => {
    if (selectedStudent) {
      const updatedStudents = {
        ...data.students,
        [selectedStudent.id]: {
          ...data.students[selectedStudent.id],
          churnDate: format(date, 'yyyy-MM-dd')
        }
      };
      
      setData({
        ...data,
        students: updatedStudents
      });
      
      toast({
        title: "Churn Date Set",
        description: `${selectedStudent.name} marked as churned on ${format(date, 'MMMM d, yyyy')}.`,
      });
    }
  };

  const handleViewDates = (student: Student) => {
    setSelectedStudent(student);
    setDateModalType("other");
    setDateModalOpen(true);
  };

  const handleAddNote = (studentId: string, note: Omit<Note, "id" | "timestamp">) => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      ...note,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    
    const updatedStudents = {
      ...data.students,
      [studentId]: {
        ...data.students[studentId],
        notes: [...(data.students[studentId].notes || []), newNote]
      }
    };
    
    setData({
      ...data,
      students: updatedStudents
    });
    
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
    
    const updatedStudents = {
      ...data.students,
      [selectedStudent.id]: {
        ...data.students[selectedStudent.id],
        csm: teamId
      }
    };
    
    setData({
      ...data,
      students: updatedStudents
    });
  };

  const formatDateInfo = (student: Student) => {
    if (student.startDate) {
      return (
        <div className="text-xs text-muted-foreground mt-1">
          {student.startDate && <div>Start: {format(new Date(student.startDate), 'MMM d, yyyy')}</div>}
          {student.endDate && <div>End: {format(new Date(student.endDate), 'MMM d, yyyy')}</div>}
          {student.churnDate && <div className="text-red-500">Churned: {format(new Date(student.churnDate), 'MMM d, yyyy')}</div>}
          {student.csm && <div className="font-semibold mt-1">{CSM_TEAMS.find(team => team.id === student.csm)?.name}</div>}
        </div>
      );
    }
    return null;
  };
  
  const teamStats = () => {
    if (selectedTeam === "all") {
      return {
        total: Object.keys(data.students).length,
        active: data.columns.active.studentIds.length,
        graduated: data.columns.graduated.studentIds.length,
        churned: data.columns.churned.studentIds.length,
      };
    }
    
    const teamStudents = Object.values(data.students).filter(student => student.csm === selectedTeam);
    const teamIds = teamStudents.map(student => student.id);
    
    return {
      total: teamStudents.length,
      active: data.columns.active.studentIds.filter(id => teamIds.includes(id)).length,
      graduated: data.columns.graduated.studentIds.filter(id => teamIds.includes(id)).length,
      churned: data.columns.churned.studentIds.filter(id => teamIds.includes(id)).length,
    };
  };
  
  const stats = teamStats();
  
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
              {data.columnOrder.map(columnId => {
                const column = filteredData.columns[columnId];
                const students = column.studentIds.map(studentId => data.students[studentId]);
                
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
