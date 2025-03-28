
import { AlertCircle } from "lucide-react";

interface ValidationErrorProps {
  message: string;
}

export function ValidationError({ message }: ValidationErrorProps) {
  if (!message) return null;
  
  return (
    <div className="flex items-center text-destructive text-sm mt-1">
      <AlertCircle className="h-4 w-4 mr-1" />
      <span>{message}</span>
    </div>
  );
}
