
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export function LoadingState({ 
  message = "Loading...", 
  className,
  size = "md",
  showProgress = false
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4",
      className
    )}>
      <Loader className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size]
      )} />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {showProgress && (
        <div className="w-48 h-1 bg-gray-200 mt-4 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      )}
    </div>
  );
}
