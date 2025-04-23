
import { useState, useEffect, useRef, useCallback } from "react";

export interface BackgroundTask {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  startTime?: Date;
  endTime?: Date;
  error?: Error;
}

export interface UseBackgroundTasksOptions {
  maxConcurrent?: number;
  keepCompleted?: number; // How many completed tasks to keep in history
}

// Adding an interface for queued tasks to track their IDs
interface QueuedTask {
  id: string;
  taskFn: () => Promise<any>;
}

/**
 * Custom hook for managing background tasks with status tracking
 */
export function useBackgroundTasks(options: UseBackgroundTasksOptions = {}) {
  const { 
    maxConcurrent = 3,
    keepCompleted = 5
  } = options;
  
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // Update the queue to store task objects with IDs instead of just functions
  const taskQueue = useRef<QueuedTask[]>([]);
  
  // Process the next task in the queue
  const processQueue = useCallback(async () => {
    if (taskQueue.current.length === 0) {
      setIsProcessing(false);
      return;
    }
    
    setIsProcessing(true);
    
    // Count running tasks
    const runningTasks = tasks.filter(t => t.status === 'running').length;
    
    // Only start new tasks if we're under the concurrent limit
    if (runningTasks < maxConcurrent && taskQueue.current.length > 0) {
      const nextTask = taskQueue.current.shift();
      if (nextTask) {
        try {
          await nextTask.taskFn(); // Execute the taskFn from the QueuedTask object
        } catch (error) {
          console.error("Background task error:", error);
        }
        
        // Process the next task
        setTimeout(processQueue, 0);
      }
    }
  }, [tasks, maxConcurrent]);
  
  // Add a new task to the queue
  const addTask = useCallback((
    taskId: string, 
    taskName: string, 
    taskFn: () => Promise<any>
  ) => {
    // Create the task record
    const newTask: BackgroundTask = {
      id: taskId,
      name: taskName,
      status: 'idle',
      startTime: new Date()
    };
    
    // Add to task list
    setTasks(prev => [...prev, newTask]);
    
    // Create a wrapped task function that updates status
    const wrappedTaskFn = async () => {
      // Update status to running
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'running' as const, startTime: new Date() } 
          : t
      ));
      
      try {
        // Run the actual task
        const result = await taskFn();
        
        // Update status to completed
        setTasks(prev => {
          const updated = prev.map(t => 
            t.id === taskId 
              ? { 
                  ...t, 
                  status: 'completed' as const, 
                  endTime: new Date(),
                  progress: 100 
                } 
              : t
          );
          
          // Limit the number of completed tasks we keep
          const completedTasks = updated.filter(t => t.status === 'completed');
          if (completedTasks.length > keepCompleted) {
            return updated.filter(t => 
              t.status !== 'completed' || 
              completedTasks.indexOf(t) >= completedTasks.length - keepCompleted
            );
          }
          
          return updated;
        });
        
        return result;
      } catch (error) {
        // Update status to failed
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: 'failed' as const, 
                endTime: new Date(), 
                error: error instanceof Error ? error : new Error(String(error))
              } 
            : t
        ));
        
        throw error;
      }
    };
    
    // Add to queue as a QueuedTask object with ID and function
    taskQueue.current.push({ id: taskId, taskFn: wrappedTaskFn });
    if (!isProcessing) {
      processQueue();
    }
    
    return taskId;
  }, [isProcessing, processQueue, keepCompleted]);
  
  // Update task progress
  const updateTaskProgress = useCallback((taskId: string, progress: number, message?: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, progress, message: message || t.message } 
        : t
    ));
  }, []);
  
  // Cancel a task by ID
  const cancelTask = useCallback((taskId: string) => {
    // Remove from queue if still queued
    taskQueue.current = taskQueue.current.filter(task => task.id !== taskId);
    
    // Update status if already running
    setTasks(prev => prev.map(t => 
      t.id === taskId && t.status === 'running'
        ? { ...t, status: 'failed' as const, message: 'Task cancelled by user', endTime: new Date() } 
        : t
    ));
  }, []);
  
  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(t => t.status !== 'completed'));
  }, []);
  
  // Process queue when tasks change
  useEffect(() => {
    if (!isProcessing && taskQueue.current.length > 0) {
      processQueue();
    }
  }, [tasks, isProcessing, processQueue]);
  
  return {
    tasks,
    isProcessing,
    addTask,
    updateTaskProgress,
    cancelTask,
    clearCompletedTasks
  };
}
