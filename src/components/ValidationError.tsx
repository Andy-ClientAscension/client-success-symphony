
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react";

interface ValidationErrorProps {
  message: string;
  type?: "error" | "warning" | "info";
  className?: string;
}

export function ValidationError({ 
  message, 
  type = "error",
  className = "" 
}: ValidationErrorProps) {
  if (!message) return null;
  
  const icons = {
    error: <XCircle className="h-4 w-4 mr-1" />,
    warning: <AlertTriangle className="h-4 w-4 mr-1" />,
    info: <AlertCircle className="h-4 w-4 mr-1" />
  };
  
  const colorClasses = {
    error: "text-destructive",
    warning: "text-warning-600",
    info: "text-blue-600"
  };
  
  return (
    <div className={`flex items-center ${colorClasses[type]} text-sm mt-1 ${className}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}
