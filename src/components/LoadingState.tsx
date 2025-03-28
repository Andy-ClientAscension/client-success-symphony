
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullPage?: boolean;
}

type SizeClasses = {
  [key in LoadingStateProps["size"]]: string;
};

export function LoadingState({ 
  message = "Loading...", 
  size = "md",
  className = "",
  fullPage = false
}: LoadingStateProps) {
  const sizeClasses: SizeClasses = {
    sm: "h-4 w-4 min-w-4",
    md: "h-8 w-8 min-w-8",
    lg: "h-12 w-12 min-w-12"
  };

  const containerClasses = fullPage 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50" 
    : `flex flex-col items-center justify-center p-4 space-y-3 ${className}`;

  return (
    <div className={containerClasses} role="status">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-red-600`} 
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-sm">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}
