
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ 
  message = "Loading...", 
  size = "md" 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-red-600`} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
