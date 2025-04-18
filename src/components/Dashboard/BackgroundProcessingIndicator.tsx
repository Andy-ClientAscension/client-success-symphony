
import React from 'react';
import { CircleAlert, Bot, RefreshCw, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BackgroundTaskStatus {
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
  const activeTasks = tasks.filter(task => task.status === 'running').length;
  const errorTasks = tasks.filter(task => task.status === 'error').length;
  
  let overallStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  
  if (errorTasks > 0) {
    overallStatus = 'error';
  } else if (activeTasks > 0) {
    overallStatus = 'running';
  } else if (tasks.some(task => task.status === 'success')) {
    overallStatus = 'success';
  }
  
  const getStatusIcon = () => {
    const iconProps = {
      className: "h-4 w-4",
      "aria-hidden": true, // Changed from string to boolean
      role: "img"
    };

    switch (overallStatus) {
      case 'running':
        return <RefreshCw {...iconProps} className="h-4 w-4 animate-spin text-blue-500" aria-label="Processing" />;
      case 'success':
        return <Check {...iconProps} className="h-4 w-4 text-green-500" aria-label="Completed" />;
      case 'error':
        return <CircleAlert {...iconProps} className="h-4 w-4 text-red-500" aria-label="Error" />;
      default:
        return <Bot {...iconProps} className="h-4 w-4 text-muted-foreground" aria-label="Idle" />;
    }
  };

  const getStatusDescription = () => {
    if (errorTasks > 0) {
      return `${errorTasks} ${errorTasks === 1 ? 'task has' : 'tasks have'} encountered errors`;
    } else if (activeTasks > 0) {
      return `${activeTasks} ${activeTasks === 1 ? 'task is' : 'tasks are'} running`;
    } else if (tasks.some(task => task.status === 'success')) {
      return 'All tasks completed successfully';
    }
    return 'No tasks running';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            role="status"
            aria-live="polite"
            className={cn(
              "cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              overallStatus === 'running' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
              overallStatus === 'success' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
              overallStatus === 'error' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
              overallStatus === 'idle' && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
              className
            )}
            onClick={onClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }}
            tabIndex={0}
          >
            {getStatusIcon()}
            <span className="ml-1 text-xs whitespace-nowrap">
              {activeTasks > 0 ? `${activeTasks} running` : 'Background Tasks'}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 p-1">
            <p className="text-sm font-medium" role="status">{getStatusDescription()}</p>
            <ul className="text-xs space-y-1">
              {tasks.map(task => (
                <li 
                  key={task.id} 
                  className="flex items-center gap-1"
                  role="listitem"
                >
                  {task.status === 'running' && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" aria-label="Running" />}
                  {task.status === 'success' && <Check className="h-3 w-3 text-green-500" aria-label="Complete" />}
                  {task.status === 'error' && <CircleAlert className="h-3 w-3 text-red-500" aria-label="Error" />}
                  {task.status === 'idle' && <Bot className="h-3 w-3 text-muted-foreground" aria-label="Idle" />}
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
