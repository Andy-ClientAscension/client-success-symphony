
import { useState, useEffect } from "react";
import { format, isPast, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Check, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Client, getAllClients } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";

interface Task {
  id: string;
  title: string;
  clientId: string | null;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
  assignedTo: string;
  createdAt: string;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    clientId: null,
    dueDate: new Date().toISOString(),
    priority: 'medium',
    status: 'pending',
    description: '',
    assignedTo: '',
  });
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  useEffect(() => {
    // Load clients
    const allClients = getAllClients();
    setClients(allClients);
    
    // Load saved tasks or initialize with example tasks
    const savedTasks = loadData(STORAGE_KEYS.TASKS, [
      {
        id: '1',
        title: 'Follow up on renewal',
        clientId: allClients[0]?.id || null,
        dueDate: new Date(2023, 8, 20).toISOString(),
        priority: 'high',
        status: 'pending',
        description: 'Contact client about upcoming contract renewal',
        assignedTo: 'Andy Smith',
        createdAt: new Date(2023, 8, 10).toISOString(),
      },
      {
        id: '2',
        title: 'Schedule onboarding call',
        clientId: allClients[1]?.id || null,
        dueDate: new Date(2023, 8, 22).toISOString(),
        priority: 'medium',
        status: 'in-progress',
        description: 'Set up initial onboarding call with new client',
        assignedTo: 'Chris Johnson',
        createdAt: new Date(2023, 8, 12).toISOString(),
      },
      {
        id: '3',
        title: 'Resolve support ticket #1234',
        clientId: allClients[2]?.id || null,
        dueDate: new Date(2023, 8, 18).toISOString(),
        priority: 'high',
        status: 'completed',
        description: 'Client reported issues with API integration',
        assignedTo: 'Alex Wilson',
        createdAt: new Date(2023, 8, 15).toISOString(),
      }
    ]);
    
    setTasks(savedTasks);
  }, []);
  
  // Save tasks when they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveData(STORAGE_KEYS.TASKS, tasks);
    }
  }, [tasks]);
  
  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: "Task title required",
        description: "Please provide a title for the task",
        variant: "destructive",
      });
      return;
    }
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title || '',
      clientId: newTask.clientId || null,
      dueDate: newTask.dueDate || new Date().toISOString(),
      priority: newTask.priority as 'low' | 'medium' | 'high' || 'medium',
      status: 'pending',
      description: newTask.description || '',
      assignedTo: newTask.assignedTo || '',
      createdAt: new Date().toISOString(),
    };
    
    setTasks([...tasks, task]);
    setIsAddTaskOpen(false);
    setNewTask({
      title: '',
      clientId: null,
      dueDate: new Date().toISOString(),
      priority: 'medium',
      status: 'pending',
      description: '',
      assignedTo: '',
    });
    
    toast({
      title: "Task Added",
      description: "New task has been created successfully",
    });
  };
  
  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    ));
    
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}`,
    });
  };
  
  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      default:
        return null;
    }
  };
  
  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });
  
  // Sort tasks by priority and due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First by status (pending first)
    if (a.status !== b.status) {
      if (a.status === 'completed') return 1;
      if (b.status === 'completed') return -1;
    }
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Task Manager</CardTitle>
        <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="text-sm">Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="priority-filter" className="text-sm">Priority:</Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger id="priority-filter" className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => {
              const dueDate = new Date(task.dueDate);
              const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';
              const client = clients.find(c => c.id === task.clientId);
              
              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "border rounded-md p-3",
                    task.status === 'completed' ? "bg-muted/40" : "",
                    isOverdue ? "border-red-300" : "border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {task.status === 'completed' ? (
                          <span className="line-through text-muted-foreground">{task.title}</span>
                        ) : (
                          task.title
                        )}
                      </div>
                      
                      {client && (
                        <div className="text-xs text-muted-foreground">
                          Client: {client.name}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Assigned to: {task.assignedTo || 'Unassigned'}
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "flex items-center gap-1",
                            isOverdue ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {format(dueDate, 'MMM d')}
                          {isOverdue && " (overdue)"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {task.status !== 'completed' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8" 
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'completed' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8" 
                          onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found with the selected filters
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="text-xs text-muted-foreground w-full flex justify-between">
          <span>Total: {tasks.length} tasks</span>
          <span>
            {tasks.filter(t => t.status === 'completed').length} completed, 
            {tasks.filter(t => t.status !== 'completed').length} active
          </span>
        </div>
      </CardFooter>
      
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                placeholder="Enter task title" 
                value={newTask.title || ''}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Client (Optional)</Label>
              <Select 
                value={newTask.clientId || ''} 
                onValueChange={(value) => setNewTask({...newTask, clientId: value || null})}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={newTask.priority || 'medium'} 
                onValueChange={(value: any) => setNewTask({...newTask, priority: value})}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.dueDate ? (
                      format(new Date(newTask.dueDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTask.dueDate ? new Date(newTask.dueDate) : undefined}
                    onSelect={(date) => date && setNewTask({...newTask, dueDate: date.toISOString()})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assigned">Assigned To</Label>
              <Input 
                id="assigned"
                placeholder="Enter name" 
                value={newTask.assignedTo || ''}
                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description"
                placeholder="Enter task details" 
                value={newTask.description || ''}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
