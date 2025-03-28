
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullPage?: boolean;
  color?: "default" | "primary" | "destructive";
  showProgress?: boolean;
  progressValue?: number;
}

type SizeClasses = {
  [key in LoadingStateProps["size"]]: string;
};

type ColorClasses = {
  [key in Required<LoadingStateProps>["color"]]: string;
};

export function LoadingState({ 
  message = "Loading...", 
  size = "md",
  className = "",
  fullPage = false,
  color = "primary",
  showProgress = false,
  progressValue
}: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (showProgress && progressValue === undefined) {
      // If showing progress but no value provided, simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Slow down as it approaches 90%
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : prev < 85 ? 2 : 0.5;
          const newValue = Math.min(prev + increment, 90);
          return newValue;
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else if (progressValue !== undefined) {
      setProgress(progressValue);
    }
  }, [showProgress, progressValue]);

  const sizeClasses: SizeClasses = {
    sm: "h-4 w-4 min-w-4",
    md: "h-8 w-8 min-w-8",
    lg: "h-12 w-12 min-w-12"
  };

  const colorClasses: ColorClasses = {
    default: "text-muted-foreground",
    primary: "text-red-600",
    destructive: "text-destructive"
  };

  const containerClasses = fullPage 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50" 
    : `flex flex-col items-center justify-center p-4 space-y-3 ${className}`;

  return (
    <div className={containerClasses} role="status">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin ${colorClasses[color]}`} 
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-sm">{message}</p>
      
      {showProgress && (
        <div className="w-full max-w-xs mt-2">
          <Progress value={progress} className="h-2" />
          {progressValue !== undefined && (
            <p className="text-xs text-center mt-1 text-muted-foreground">
              {Math.round(progress)}%
            </p>
          )}
        </div>
      )}
      
      <span className="sr-only">{message}</span>
    </div>
  );
}
