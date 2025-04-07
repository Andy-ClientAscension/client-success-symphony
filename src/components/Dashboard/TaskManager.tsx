
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Plus, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CSM_TEAMS } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Task {
  id: string;
  title: string;
  clientId: string | undefined;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: string;
  description: string;
  assignedTo: string;
  createdAt: string;
}

interface TaskManagerProps {
  clientId?: string; // Make clientId optional to support both client-specific and global task views
}

export function TaskManager({ clientId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: new Date().toISOString(),
    priority: "medium",
    status: "todo",
    assignedTo: "",
    clientId: clientId
  });
  const [date, setDate] = useState<Date>(new Date());
  const [csmTeamMembers, setCsmTeamMembers] = useState<string[]>([
    "Andy Smith",
    "Chris Johnson",
    "Alex Parker",
    "Cillin McEvoy",
    "Sarah Wilson",
    "Michael Brown",
    "Jessica Lee",
    "Robert Taylor"
  ]);
  
  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = loadData<Task[]>(STORAGE_KEYS.TASKS, []);
    // Filter tasks based on clientId if provided
    const filteredTasks = clientId 
      ? storedTasks.filter(task => task.clientId === clientId)
      : storedTasks;
    setTasks(filteredTasks);
  }, [clientId]);

  const getFilteredTasks = () => {
    switch(activeTab) {
      case "completed":
        return tasks.filter(task => task.status === "completed");
      case "inprogress":
        return tasks.filter(task => task.status === "in-progress");
      case "todo":
        return tasks.filter(task => task.status === "todo");
      default:
        return tasks;
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // Update the task status in the local state
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    setTasks(updatedTasks);
    
    // Update in localStorage
    const allTasks = loadData<Task[]>(STORAGE_KEYS.TASKS, []);
    const updatedAllTasks = allTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    saveData(STORAGE_KEYS.TASKS, updatedAllTasks);
    
    toast({
      title: "Task Updated",
      description: `Task status has been updated to ${newStatus}`,
    });
  };

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    const taskId = `task-${Date.now()}`;
    const task: Task = {
      id: taskId,
      title: newTask.title || "",
      description: newTask.description || "",
      dueDate: newTask.dueDate || new Date().toISOString(),
      priority: newTask.priority as "high" | "medium" | "low" || "medium",
      status: newTask.status || "todo",
      assignedTo: newTask.assignedTo || "",
      createdAt: new Date().toISOString(),
      clientId: clientId
    };

    // Add to local state
    setTasks(prev => [...prev, task]);

    // Add to localStorage
    const allTasks = loadData<Task[]>(STORAGE_KEYS.TASKS, []);
    saveData(STORAGE_KEYS.TASKS, [...allTasks, task]);

    // Reset form and close dialog
    setNewTask({
      title: "",
      description: "",
      dueDate: new Date().toISOString(),
      priority: "medium",
      status: "todo",
      assignedTo: "",
      clientId: clientId
    });
    setIsAddTaskDialogOpen(false);

    toast({
      title: "Task Created",
      description: "New task has been added successfully"
    });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setNewTask(prev => ({
        ...prev,
        dueDate: selectedDate.toISOString()
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Manager</CardTitle>
        <CardDescription>
          {clientId ? "Manage tasks for this client" : "Manage all tasks"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="todo">To Do</TabsTrigger>
                <TabsTrigger value="inprogress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="ml-2 flex items-center gap-1 bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task and assign it to a team member
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="col-span-3"
                      placeholder="Task title"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      className="col-span-3"
                      placeholder="Task description"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">
                      Due Date
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value) => setNewTask({...newTask, priority: value as "high" | "medium" | "low"})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignedTo" className="text-right">
                      Assigned To
                    </Label>
                    <Select 
                      value={newTask.assignedTo} 
                      onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Assign to CSM/SSC" />
                      </SelectTrigger>
                      <SelectContent>
                        {csmTeamMembers.map((csm) => (
                          <SelectItem key={csm} value={csm}>
                            {csm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddTaskDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddTask}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {getFilteredTasks().length > 0 ? (
            <div className="space-y-3">
              {getFilteredTasks().map((task) => (
                <div 
                  key={task.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-gray-500" />
                          <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center gap-1 ml-3">
                            <span className="text-blue-600">Assigned to: {task.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === "high" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                          : task.priority === "medium" 
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" 
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <Select 
                        defaultValue={task.status}
                        onValueChange={(value) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger className="w-32 ml-2 h-7 text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {task.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  )}
                  <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No tasks found</p>
              <p className="text-sm mt-1">
                {activeTab !== "all" ? 
                  `No ${activeTab} tasks available` : 
                  clientId ? "No tasks for this client yet" : "No tasks have been created yet"
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-red-600 hover:bg-red-700">Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
