
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react";

interface ValidationErrorProps {
  message: string;
  type?: "error" | "warning" | "info";
  className?: string;
  showIcon?: boolean;
}

type IconMapping = {
  [key in ValidationErrorProps["type"]]: JSX.Element;
};

type ColorMapping = {
  [key in ValidationErrorProps["type"]]: string;
};

export function ValidationError({ 
  message, 
  type = "error",
  className = "",
  showIcon = true
}: ValidationErrorProps) {
  if (!message) return null;
  
  const icons: IconMapping = {
    error: <XCircle className="h-4 w-4 min-w-4 mr-1" />,
    warning: <AlertTriangle className="h-4 w-4 min-w-4 mr-1" />,
    info: <AlertCircle className="h-4 w-4 min-w-4 mr-1" />
  };
  
  const colorClasses: ColorMapping = {
    error: "text-destructive",
    warning: "text-warning-600",
    info: "text-blue-600"
  };
  
  return (
    <div className={`flex items-start ${colorClasses[type]} text-sm mt-1 ${className}`}>
      {showIcon && (
        <div className="shrink-0 mt-0.5">
          {icons[type]}
        </div>
      )}
      <span className="flex-1">{message}</span>
    </div>
  );
}
