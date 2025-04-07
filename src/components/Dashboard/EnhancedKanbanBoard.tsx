import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanSquare, Plus, MoreVertical, Calendar, Users, MessageSquare, AlertTriangle, UserCheck, Maximize2, Minimize2, PauseCircle, AlertOctagon, DollarSign, BarChart } from "lucide-react";
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
import { useKanbanStore } from "@/utils/kanbanStore";

export function EnhancedKanbanBoard({ fullScreen = false }: { fullScreen?: boolean }) {
  const {
    data,
    filteredData,
    selectedTeam,
    setSelectedTeam,
    moveStudent,
    addChurnDate,
    addPauseDate,
    resumeFromPause,
    addNote,
    updateStudentTeam,
    loadPersistedData
  } = useKanbanStore();
  
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [dateModalType, setDateModalType] = useState<"churn" | "pause" | "resume" | "other">("churn");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [teamEditOpen, setTeamEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(fullScreen);
  const [pauseReason, setPauseReason] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      loadPersistedData();
      console.log("Loaded kanban data:", data);
      console.log("Filtered kanban data:", filteredData);
    } catch (error) {
      console.error("Error loading kanban data:", error);
      toast({
        title: "Error Loading Data",
        description: "There was a problem loading the kanban board data.",
        variant: "destructive"
      });
    }
  }, []);
  
  useEffect(() => {
    try {
      const checkAllStudentPayments = async () => {
        if (!data?.students || !data?.columns) {
          console.warn("Kanban data not fully initialized for payment check");
          return;
        }

        const updatedStudents = { ...data.students };
        let hasPaymentIssues = false;
        
        for (const studentId in updatedStudents) {
          const student = updatedStudents[studentId];
          const isActive = data.columns.active?.studentIds.includes(studentId) || 
                           data.columns.backend?.studentIds.includes(studentId) ||
                           data.columns.olympia?.studentIds.includes(studentId);
          
          if (isActive) {
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
      console.error("Error checking payments:", error);
    }
  }, [data]);
  
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
      
      // Check if the data and columns are properly initialized
      if (!data?.columns || !filteredData?.columns) {
        console.error("Kanban data not properly initialized for drag operation");
        toast({
          title: "Operation Failed",
          description: "Could not move student due to data initialization issue.",
          variant: "destructive"
        });
        return;
      }
      
      if (destination.droppableId === 'churned' && source.droppableId !== 'churned') {
        setSelectedStudent(data.students[draggableId]);
        setDateModalType("churn");
        setDateModalOpen(true);
        return;
      }
      
      if (destination.droppableId === 'paused' && source.droppableId !== 'paused') {
        setSelectedStudent(data.students[draggableId]);
        setDateModalType("pause");
        setDateModalOpen(true);
        return;
      }
      
      if (source.droppableId === 'paused' && destination.droppableId !== 'paused') {
        setSelectedStudent(data.students[draggableId]);
        setDateModalType("resume");
        setDateModalOpen(true);
        return;
      }
      
      moveStudent(
        draggableId, 
        source.droppableId, 
        destination.droppableId, 
        source.index, 
        destination.index
      );
    } catch (error) {
      console.error("Error in drag operation:", error);
      toast({
        title: "Operation Failed",
        description: "There was an error moving the student.",
        variant: "destructive"
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
      
      moveStudent(
        selectedStudent.id,
        filteredData.columnOrder.find(id => 
          filteredData.columns[id].studentIds.includes(selectedStudent.id)
        ) || '',
        'churned',
        0,
        0
      );
    }
  };
  
  const handlePauseDateConfirm = (date: Date, reason?: string) => {
    if (selectedStudent && reason) {
      addPauseDate(selectedStudent.id, date, reason);
      
      toast({
        title: "Student Paused",
        description: `${selectedStudent.name} placed on pause from ${format(date, 'MMMM d, yyyy')}.`,
      });
      
      moveStudent(
        selectedStudent.id,
        filteredData.columnOrder.find(id => 
          filteredData.columns[id].studentIds.includes(selectedStudent.id)
        ) || '',
        'paused',
        0,
        0
      );
      
      setPauseReason("");
    }
  };
  
  const handleResumeConfirm = (date: Date) => {
    if (selectedStudent) {
      resumeFromPause(selectedStudent.id, date);
      
      toast({
        title: "Student Resumed",
        description: `${selectedStudent.name} resumed active status from ${format(date, 'MMMM d, yyyy')}.`,
      });
      
      moveStudent(
        selectedStudent.id,
        'paused',
        'active',
        0,
        0
      );
    }
  };

  const handleViewDates = (student: any) => {
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

  const handleEditTeam = (student: any) => {
    setSelectedStudent(student);
    setTeamEditOpen(true);
  };

  const handleTeamChange = (teamId: string) => {
    if (!selectedStudent) return;
    
    updateStudentTeam(selectedStudent.id, teamId);
  };

  const formatDateInfo = (student: any) => {
    if (student.startDate) {
      return (
        <div className="text-xs text-muted-foreground mt-1">
          {student.startDate && <div>Start: {format(new Date(student.startDate), 'MMM d, yyyy')}</div>}
          {student.endDate && <div>End: {format(new Date(student.endDate), 'MMM d, yyyy')}</div>}
          {student.churnDate && <div className="text-red-500">Churned: {format(new Date(student.churnDate), 'MMM d, yyyy')}</div>}
          {student.pauseDate && (
            <div className="text-amber-500">
              Paused: {format(new Date(student.pauseDate), 'MMM d, yyyy')}
              {student.resumeDate && <> until {format(new Date(student.resumeDate), 'MMM d, yyyy')}</>}
            </div>
          )}
          {student.pauseReason && <div className="text-amber-500 italic">{student.pauseReason}</div>}
          {student.csm && <div className="font-semibold mt-1">{CSM_TEAMS.find(team => team.id === student.csm)?.name || student.csm}</div>}
        </div>
      );
    }
    return null;
  };
  
  const teamStats = () => {
    try {
      if (!data?.students || !data?.columns || !filteredData?.columns) {
        console.warn("Kanban data not fully initialized for team stats calculation");
        return {
          total: 0,
          active: 0,
          graduated: 0,
          churned: 0,
          paused: 0,
          backend: 0,
          olympia: 0,
        };
      }
      
      if (selectedTeam === "all") {
        return {
          total: Object.keys(data.students).length,
          active: data.columns.active?.studentIds?.length || 0,
          graduated: data.columns.graduated?.studentIds?.length || 0,
          churned: data.columns.churned?.studentIds?.length || 0,
          paused: data.columns.paused?.studentIds?.length || 0,
          backend: data.columns.backend?.studentIds?.length || 0,
          olympia: data.columns.olympia?.studentIds?.length || 0,
        };
      }
      
      const teamStudents = Object.values(data.students).filter(student => student.csm === selectedTeam);
      const teamIds = teamStudents.map(student => student.id);
      
      return {
        total: teamStudents.length,
        active: (data.columns.active?.studentIds || []).filter(id => teamIds.includes(id)).length,
        graduated: (data.columns.graduated?.studentIds || []).filter(id => teamIds.includes(id)).length,
        churned: (data.columns.churned?.studentIds || []).filter(id => teamIds.includes(id)).length,
        paused: (data.columns.paused?.studentIds || []).filter(id => teamIds.includes(id)).length,
        backend: (data.columns.backend?.studentIds || []).filter(id => teamIds.includes(id)).length,
        olympia: (data.columns.olympia?.studentIds || []).filter(id => teamIds.includes(id)).length,
      };
    } catch (error) {
      console.error("Error calculating team stats:", error);
      return { 
        total: 0, 
        active: 0, 
        graduated: 0, 
        churned: 0,
        paused: 0,
        backend: 0,
        olympia: 0
      };
    }
  };
  
  const stats = teamStats();
  
  const boardHeight = expanded ? "max-h-[calc(100vh-200px)]" : "max-h-[calc(100vh-250px)]";
  
  const handleDateModalClose = () => {
    setDateModalOpen(false);
    setPauseReason("");
  };
  
  const getStudentMetricsRow = (student) => {
    if (!student.mrr && !student.npsScore) return null;
    
    return (
      <div className="flex items-center justify-between mt-2 border-t pt-1 text-xs text-gray-600">
        {student.mrr !== undefined && (
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-0.5 text-green-600" />
            <span>{student.mrr}</span>
          </div>
        )}
        {student.npsScore !== undefined && (
          <div className="flex items-center">
            <BarChart className="h-3 w-3 mr-0.5 text-blue-600" />
            <span className={`${student.npsScore > 8 ? 'text-green-600' : student.npsScore > 6 ? 'text-amber-600' : 'text-red-600'}`}>
              {student.npsScore}/10
            </span>
          </div>
        )}
      </div>
    );
  };
  
  console.log("Rendering kanban with data:", filteredData);
  console.log("Column order:", filteredData.columnOrder);
  
  // If data is not properly loaded, show a loading state
  if (!filteredData?.columns || !filteredData?.columnOrder || filteredData.columnOrder.length === 0) {
    return (
      <Card className={`${expanded ? 'fixed inset-0 z-50 m-4 rounded-lg' : 'mt-4'} overflow-hidden`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <KanbanSquare className="h-5 w-5 text-red-600" />
            <CardTitle>Student Tracking</CardTitle>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8"
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center h-60 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent text-red-600"></div>
            <div className="text-lg font-medium">Loading student data...</div>
            <div className="text-sm text-muted-foreground max-w-md">
              If this takes too long, please refresh the page or check the console for errors.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${expanded ? 'fixed inset-0 z-50 m-4 rounded-lg' : 'mt-4'} overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <KanbanSquare className="h-5 w-5 text-red-600" />
          <CardTitle>Student Tracking</CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8"
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
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
              {CSM_TEAMS.find(team => team.id === selectedTeam)?.name || selectedTeam} Stats
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-xl font-bold text-green-600">{stats.active}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Backend</div>
                <div className="text-xl font-bold text-purple-600">{stats.backend}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Olympia</div>
                <div className="text-xl font-bold text-indigo-600">{stats.olympia}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Paused</div>
                <div className="text-xl font-bold text-amber-600">{stats.paused}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Graduated</div>
                <div className="text-xl font-bold text-blue-600">{stats.graduated}</div>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500">Churned</div>
                <div className="text-xl font-bold text-red-600">{stats.churned}</div>
              </div>
            </div>
          </div>
        )}
        
        <ScrollArea className={`h-full ${boardHeight}`}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className={`grid grid-cols-1 ${expanded ? 'lg:grid-cols-6' : 'md:grid-cols-3 lg:grid-cols-6'} gap-4 pb-4 overflow-x-auto`}>
              {filteredData.columnOrder.map(columnId => {
                const column = filteredData.columns[columnId];
                if (!column || !column.studentIds) {
                  console.warn(`Column ${columnId} is missing or has no studentIds array`);
                  return null;
                }
                
                const students = column.studentIds
                  .map(studentId => data.students?.[studentId])
                  .filter(Boolean);
                
                const getColumnStyle = () => {
                  switch(columnId) {
                    case 'churned': return "border-l-4 border-red-400";
                    case 'paused': return "border-l-4 border-amber-400";
                    case 'graduated': return "border-l-4 border-blue-400";
                    case 'backend': return "border-l-4 border-purple-400";
                    case 'olympia': return "border-l-4 border-indigo-400";
                    default: return "border-l-4 border-green-400";
                  }
                };
                
                return (
                  <div key={columnId} className={`flex flex-col bg-secondary/50 rounded-lg p-3 min-w-[250px] ${getColumnStyle()}`}>
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
                                      {student.pauseDate && (
                                        <Badge 
                                          variant="outline" 
                                          className="mr-2 px-1.5 py-0.5 flex items-center border-amber-200 bg-amber-50"
                                        >
                                          <PauseCircle className="h-3 w-3 mr-1 text-amber-600" />
                                          <span>Paused</span>
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
                                          {columnId !== 'paused' && (
                                            <DropdownMenuItem 
                                              onClick={() => {
                                                setSelectedStudent(student);
                                                setDateModalType("pause");
                                                setDateModalOpen(true);
                                              }}
                                            >
                                              <PauseCircle className="h-3 w-3 mr-2" /> Pause Student
                                            </DropdownMenuItem>
                                          )}
                                          {columnId === 'paused' && (
                                            <DropdownMenuItem 
                                              onClick={() => {
                                                setSelectedStudent(student);
                                                setDateModalType("resume");
                                                setDateModalOpen(true);
                                              }}
                                            >
                                              <PauseCircle className="h-3 w-3 mr-2" /> Resume Student
                                            </DropdownMenuItem>
                                          )}
                                          {columnId !== 'churned' && (
                                            <DropdownMenuItem 
                                              onClick={() => {
                                                setSelectedStudent(student);
                                                setDateModalType("churn");
                                                setDateModalOpen(true);
                                              }}
                                            >
                                              <AlertOctagon className="h-3 w-3 mr-2" /> Mark as Churned
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem>Edit Student</DropdownMenuItem>
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
                                  {getStudentMetricsRow(student)}
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
            onClose={handleDateModalClose}
            onConfirm={
              dateModalType === "churn" 
                ? handleChurnDateConfirm 
                : dateModalType === "pause" 
                ? handlePauseDateConfirm
                : dateModalType === "resume"
                ? handleResumeConfirm
                : () => {}
            }
            title={
              dateModalType === "churn" 
                ? `Set Churn Date for ${selectedStudent.name}`
                : dateModalType === "pause"
                ? `Pause ${selectedStudent.name}`
                : dateModalType === "resume"
                ? `Resume ${selectedStudent.name}`
                : `Date Information for ${selectedStudent.name}`
            }
            defaultDate={
              dateModalType === "churn" || dateModalType === "pause" || dateModalType === "resume"
                ? new Date() 
                : selectedStudent.churnDate 
                  ? new Date(selectedStudent.churnDate)
                  : new Date()
            }
            showReasonField={dateModalType === "pause"}
            reason={pauseReason}
            onReasonChange={(reason) => setPauseReason(reason)}
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
