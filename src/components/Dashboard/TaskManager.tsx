
import React, { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Tasks } from '@/types/tasks';
import { useAuth } from '@/hooks/use-auth';

export function TaskManager() {
  const { tasks, createTask, updateTask } = useTasks();
  const { user } = useAuth();
  const [newTask, setNewTask] = useState<Partial<Tasks.Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: ''
  });

  const handleCreateTask = async () => {
    if (!newTask.title || !user) return;

    await createTask({
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority as Tasks.Priority || 'medium',
      status: newTask.status as Tasks.Status || 'pending',
      due_date: newTask.due_date,
      assigned_to: newTask.assigned_to || '',
      assigned_by: user.id  // Add the missing assigned_by field
    });

    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            />
            <Select
              value={newTask.priority as string}
              onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Tasks.Task['priority'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Task Description"
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTask.due_date ? format(new Date(newTask.due_date), "PPP") : <span>Pick due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newTask.due_date ? new Date(newTask.due_date) : undefined}
                  onSelect={(date) => setNewTask(prev => ({ ...prev, due_date: date?.toISOString() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Assign To (User ID)"
              value={newTask.assigned_to}
              onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
            />
          </div>
          <Button onClick={handleCreateTask}>Create Task</Button>

          <div className="space-y-2">
            <h3 className="font-semibold">Current Tasks</h3>
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {task.description}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={task.status}
                    onValueChange={(status) => updateTask(task.id, { status: status as Tasks.Task['status'] })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
