
import { useState } from "react";
import { kanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define types for our Kanban data structure
interface KanbanItem {
  id: string;
  name: string;
  progress: number;
  status: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
  icon: React.ReactNode;
  color: string;
}

export function KanbanBoard() {
  // Initial state with mock data
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: "active",
      title: "Active Students",
      items: [
        { id: "1", name: "John Doe", progress: 65, status: "active" },
        { id: "2", name: "Jane Smith", progress: 42, status: "active" },
        { id: "3", name: "Mike Johnson", progress: 78, status: "active" }
      ],
      icon: <Users className="h-5 w-5" />,
      color: "text-brand-600"
    },
    {
      id: "backend",
      title: "Backend Students",
      items: [
        { id: "4", name: "Sarah Williams", progress: 53, status: "backend" },
        { id: "5", name: "Tom Brown", progress: 29, status: "backend" }
      ],
      icon: <User className="h-5 w-5" />,
      color: "text-indigo-600"
    },
    {
      id: "olympia",
      title: "Olympia Students",
      items: [
        { id: "6", name: "Alex Davis", progress: 82, status: "olympia" }
      ],
      icon: <User className="h-5 w-5" />,
      color: "text-amber-600"
    },
    {
      id: "churned",
      title: "Churned Students",
      items: [
        { id: "7", name: "Chris Evans", progress: 21, status: "churned" }
      ],
      icon: <User className="h-5 w-5" />,
      color: "text-red-600"
    },
    {
      id: "graduated",
      title: "Graduated Students",
      items: [
        { id: "8", name: "Emma Wilson", progress: 100, status: "graduated" }
      ],
      icon: <User className="h-5 w-5" />,
      color: "text-green-600"
    }
  ]);

  // Handle drag end event
  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;
    
    // Create new array references to maintain immutability
    const newColumns = [...columns];
    const sourceItems = [...sourceColumn.items];
    const destItems = sourceColumn === destColumn ? sourceItems : [...destColumn.items];
    
    // Remove from source
    const [removed] = sourceItems.splice(source.index, 1);
    
    // Add to destination with updated status
    const updatedItem = { ...removed, status: destination.droppableId };
    destItems.splice(destination.index, 0, updatedItem);
    
    // Update state
    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId);
    
    newColumns[sourceColIndex] = {
      ...sourceColumn,
      items: sourceItems
    };
    
    newColumns[destColIndex] = {
      ...destColumn,
      items: destItems
    };
    
    setColumns(newColumns);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <kanban className="h-5 w-5 text-brand-600" />
          Student Tracking Board
        </CardTitle>
        <Badge variant="outline" className="ml-2">
          {columns.reduce((total, column) => total + column.items.length, 0)} Students
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 min-w-max">
              {columns.map(column => (
                <div key={column.id} className="w-72">
                  <div className={`flex items-center mb-3 ${column.color}`}>
                    {column.icon}
                    <h3 className="font-medium ml-2">{column.title}</h3>
                    <Badge variant="secondary" className="ml-2">
                      {column.items.length}
                    </Badge>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-muted/50 rounded-lg min-h-[300px] max-h-[500px] p-2"
                      >
                        <ScrollArea className="h-[500px]">
                          {column.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white rounded-md p-3 mb-2 shadow-sm border border-border hover:border-primary/50 transition-colors"
                                >
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Progress: {item.progress}%
                                  </div>
                                  <div className="w-full bg-muted h-1.5 rounded-full mt-2">
                                    <div 
                                      className="bg-brand-600 h-1.5 rounded-full" 
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </ScrollArea>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </CardContent>
    </Card>
  );
}
