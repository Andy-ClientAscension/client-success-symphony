
import React from 'react';
import { CircleAlert, Bot, RefreshCw, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BackgroundTaskStatus {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun?: Date;
  nextRun?: Date;
  message?: string;
}

interface BackgroundProcessingIndicatorProps {
  tasks: BackgroundTaskStatus[];
  className?: string;
  onClick?: () => void;
}

export function BackgroundProcessingIndicator({ 
  tasks, 
  className,
  onClick
}: BackgroundProcessingIndicatorProps) {
  // Count active tasks
  const activeTasks = tasks.filter(task => task.status === 'running').length;
  
  // Count error tasks
  const errorTasks = tasks.filter(task => task.status === 'error').length;
  
  // Determine overall status
  let overallStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  
  if (errorTasks > 0) {
    overallStatus = 'error';
  } else if (activeTasks > 0) {
    overallStatus = 'running';
  } else if (tasks.some(task => task.status === 'success')) {
    overallStatus = 'success';
  }
  
  // Get icon based on status
  const getStatusIcon = () => {
    switch (overallStatus) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <CircleAlert className="h-4 w-4 text-red-500" />;
      default:
        return <Bot className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Get color based on status
  const getStatusColor = () => {
    switch (overallStatus) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Get tooltip message
  const getTooltipMessage = () => {
    if (errorTasks > 0) {
      return `${errorTasks} background ${errorTasks === 1 ? 'task has' : 'tasks have'} encountered errors`;
    } else if (activeTasks > 0) {
      return `${activeTasks} background ${activeTasks === 1 ? 'task is' : 'tasks are'} running`;
    } else if (tasks.some(task => task.status === 'success')) {
      return 'All background tasks completed successfully';
    } else {
      return 'No background tasks running';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "cursor-pointer",
              getStatusColor(),
              className
            )}
            onClick={onClick}
          >
            {getStatusIcon()}
            <span className="ml-1 text-xs">
              {activeTasks > 0 ? `${activeTasks} running` : 'Background Tasks'}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 p-1">
            <p className="text-sm font-medium">{getTooltipMessage()}</p>
            <ul className="text-xs space-y-1">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center gap-1">
                  {task.status === 'running' && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
                  {task.status === 'success' && <Check className="h-3 w-3 text-green-500" />}
                  {task.status === 'error' && <CircleAlert className="h-3 w-3 text-red-500" />}
                  {task.status === 'idle' && <Bot className="h-3 w-3 text-muted-foreground" />}
                  <span>{task.name}:</span>
                  <span className="font-medium">
                    {task.status === 'running' ? 'Running' : 
                     task.status === 'success' ? 'Completed' :
                     task.status === 'error' ? 'Failed' : 'Idle'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
