
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSmartLoading } from "@/hooks/useSmartLoading";

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: 1 | 2 | 3 | 4 | 5;
  isLoading?: boolean;
}

export function LoadingState({ 
  message = "Loading...", 
  showProgress = false, 
  progress = undefined,
  className = "",
  size = "md",
  priority = 3,
  isLoading = true
}: LoadingStateProps) {
  const [localProgress, setLocalProgress] = useState(0);
  const { isLoading: smartIsLoading } = useSmartLoading(isLoading, {
    priority,
    minLoadingTime: 400,
    loadingDelay: 100
  });

  useEffect(() => {
    if (showProgress && progress === undefined && smartIsLoading) {
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
  }, [showProgress, progress, smartIsLoading]);

  // If not loading after smart loading logic is applied, don't render
  if (!smartIsLoading) return null;

  // Define size classes
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mb-4`} />
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
