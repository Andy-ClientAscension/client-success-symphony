
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
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";

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
    toast({
      title: "Create Task",
      description: "Task creation functionality will be available soon",
    });
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
            <Button 
              size="sm" 
              className="ml-2 flex items-center gap-1"
              onClick={handleAddTask}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
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
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </p>
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
                    <span>Assigned to: {task.assignedTo || "Unassigned"}</span>
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
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
