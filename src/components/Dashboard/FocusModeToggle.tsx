
import React from "react";
import { Button } from "@/components/ui/button";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FocusModeToggleProps {
  focusMode: boolean;
  onChange: (enabled: boolean) => void;
}

export function FocusModeToggle({ focusMode, onChange }: FocusModeToggleProps) {
  const { toast } = useToast();

  const handleToggle = () => {
    const newState = !focusMode;
    onChange(newState);
    
    toast({
      title: newState ? "Focus Mode Enabled" : "Focus Mode Disabled",
      description: newState 
        ? "Showing only essential information to reduce clutter" 
        : "Showing all dashboard components",
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleToggle}
      className="h-9 gap-2 text-sm bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm"
    >
      {focusMode ? <MaximizeIcon className="h-4 w-4" /> : <MinimizeIcon className="h-4 w-4" />}
      {focusMode ? "Expand View" : "Focus Mode"}
    </Button>
  );
}
