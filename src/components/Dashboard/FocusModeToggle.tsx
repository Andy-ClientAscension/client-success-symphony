
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
      className="h-8 gap-1 text-xs"
    >
      {focusMode ? <MaximizeIcon className="h-3.5 w-3.5" /> : <MinimizeIcon className="h-3.5 w-3.5" />}
      {focusMode ? "Expand View" : "Focus Mode"}
    </Button>
  );
}
