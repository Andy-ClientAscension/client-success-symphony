
import React, { useEffect } from "react";
import { BackgroundProcessingIndicator, BackgroundTaskStatus } from "@/components/Dashboard/BackgroundProcessingIndicator";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader } from "@/lib/accessibility";

interface BackgroundTasksPanelProps {
  isAnalyzing: boolean;
  aiError: Error | null;
  aiInsights: any[];
  lastAnalyzed: Date | null;
}

export function BackgroundTasksPanel({ 
  isAnalyzing, 
  aiError, 
  aiInsights, 
  lastAnalyzed 
}: BackgroundTasksPanelProps) {
  const { toast } = useToast();
  const [backgroundTasks, setBackgroundTasks] = React.useState<BackgroundTaskStatus[]>([
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      status: 'idle'
    },
    {
      id: 'data-sync',
      name: 'Data Synchronization',
      status: 'idle'
    }
  ]);

  // Update background task states for screen reader announcements
  useEffect(() => {
    const prevStatus = backgroundTasks.find(task => task.id === 'ai-analysis')?.status;
    const newStatus = isAnalyzing ? 'running' : aiError ? 'error' : aiInsights.length > 0 ? 'success' : 'idle';
    
    if (prevStatus !== newStatus) {
      // Announce status change to screen readers
      if (newStatus === 'running') {
        announceToScreenReader('AI analysis has started', 'polite');
      } else if (newStatus === 'error') {
        announceToScreenReader('AI analysis failed: ' + aiError?.message, 'assertive');
      } else if (newStatus === 'success' && prevStatus === 'running') {
        announceToScreenReader('AI analysis completed successfully', 'polite');
      }
    }
    
    setBackgroundTasks(prev => 
      prev.map(task => 
        task.id === 'ai-analysis' 
          ? { 
              ...task, 
              status: newStatus,
              lastRun: isAnalyzing ? undefined : lastAnalyzed || undefined,
              message: aiError ? aiError.message : undefined
            }
          : task
      )
    );
  }, [isAnalyzing, aiError, aiInsights, lastAnalyzed, backgroundTasks]);

  const handleTasksClick = () => {
    toast({
      title: "Background Tasks Status",
      description: isAnalyzing 
        ? "AI analysis is currently running in the background" 
        : aiError 
          ? `Last analysis encountered an error: ${aiError.message}` 
          : lastAnalyzed 
            ? `Last analyzed at ${lastAnalyzed.toLocaleString()}` 
            : "No recent analysis data",
    });
  };

  return (
    <BackgroundProcessingIndicator 
      tasks={backgroundTasks}
      onClick={handleTasksClick}
    />
  );
}
