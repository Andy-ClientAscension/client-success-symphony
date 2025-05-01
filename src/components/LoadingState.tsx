
import React from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  showProgress = false, 
  progress = undefined,
  className = ""
}: LoadingStateProps) {
  const [localProgress, setLocalProgress] = React.useState(0);

  React.useEffect(() => {
    if (showProgress && progress === undefined) {
      // Simulate loading progress when no actual progress is provided
      const interval = setInterval(() => {
        setLocalProgress(prev => {
          // Slow down as it approaches 90%
          if (prev >= 90) {
            return prev + 0.2;
          } else if (prev >= 60) {
            return prev + 0.5;
          } else {
            return prev + 2;
          }
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [showProgress, progress]);

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground mb-2">{message}</p>
      
      {showProgress && (
        <div className="w-full max-w-xs mt-2">
          <Progress value={progress !== undefined ? progress : Math.min(localProgress, 99)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {progress !== undefined ? `${Math.round(progress)}%` : "Please wait..."}
          </p>
        </div>
      )}
    </div>
  );
}
