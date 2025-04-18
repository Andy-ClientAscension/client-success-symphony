
import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No Data Available",
  message = "There is no data to display at this time.",
  action,
  icon = <FileQuestion className="h-8 w-8 text-muted-foreground" />,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{message}</p>
      {action && (
        <Button 
          variant="outline" 
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
