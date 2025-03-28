
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanSquare, Plus, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for student tracking
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
    's1': { id: 's1', name: 'Alice Johnson', progress: 75 },
    's2': { id: 's2', name: 'Bob Smith', progress: 60 },
    's3': { id: 's3', name: 'Carol Davis', progress: 80 },
    's4': { id: 's4', name: 'Dave Wilson', progress: 45 },
    's5': { id: 's5', name: 'Eve Brown', progress: 50 },
    's6': { id: 's6', name: 'Frank Miller', progress: 70 },
    's7': { id: 's7', name: 'Grace Lee', progress: 30 },
    's8': { id: 's8', name: 'Henry Taylor', progress: 100 },
    's9': { id: 's9', name: 'Ivy Robinson', progress: 100 }
  },
  columnOrder: ['active', 'backend', 'olympia', 'churned', 'graduated']
};

export function KanbanBoard() {
  const [data, setData] = useState(INITIAL_DATA);
  
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Moving within the same column
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
    
    // Moving from one column to another
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
  
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <KanbanSquare className="h-5 w-5 text-red-600" />
          <CardTitle>Student Tracking</CardTitle>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Student
        </Button>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.columnOrder.map(columnId => {
              const column = data.columns[columnId];
              const students = column.studentIds.map(studentId => data.students[studentId]);
              
              return (
                <div key={column.id} className="flex flex-col bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{column.title}</h3>
                    <Badge variant="brand">{students.length}</Badge>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 min-h-[200px]"
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
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                      <DropdownMenuItem>Edit Student</DropdownMenuItem>
                                      <DropdownMenuItem>Contact</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
      </CardContent>
    </Card>
  );
}
