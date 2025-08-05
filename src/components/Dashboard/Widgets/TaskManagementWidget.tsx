import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, AlertTriangle, User } from 'lucide-react';
import { getTasksWithDetails } from '@/lib/supabase-queries';
import { LoadingState } from '@/components/LoadingState';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assigned_to: string;
  assigned_by: string;
  created_at: string;
  assigned_to_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
  assigned_by_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export function TaskManagementWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasksWithDetails();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date() && t.status !== 'completed';
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatName = (profile?: { first_name?: string; last_name?: string; email: string }) => {
    if (!profile) return 'Unknown User';
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.email;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Task Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading tasks..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Task Management
        </CardTitle>
        <CardDescription>
          Recent tasks and pending assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">{pendingTasks.length}</p>
            <p className="text-sm text-blue-900">Pending</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-700">{overdueTasks.length}</p>
            <p className="text-sm text-red-900">Overdue</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-sm text-green-900">Completed</p>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Tasks</h4>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks found</p>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{task.title}</h5>
                    {isOverdue(task.due_date) && task.status !== 'completed' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Assigned to: {formatName(task.assigned_to_profile)}</span>
                    {task.due_date && (
                      <>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 ml-4">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {tasks.length > 5 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              View All Tasks ({tasks.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}