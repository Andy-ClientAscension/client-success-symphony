
import React from "react";
import { Button } from "@/components/ui/button";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface FocusModeToggleProps {
  focusMode: boolean;
  onChange: (enabled: boolean) => void;
}

export function FocusModeToggle({ focusMode, onChange }: FocusModeToggleProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
      size={isMobile ? "default" : "sm"} 
      onClick={handleToggle}
      className={`gap-2 text-sm bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm ${isMobile ? 'h-10 px-3' : 'h-9'}`}
      aria-label={focusMode ? "Expand View" : "Focus Mode"}
    >
      {focusMode ? <MaximizeIcon className="h-4 w-4" /> : <MinimizeIcon className="h-4 w-4" />}
      {!isMobile && (focusMode ? "Expand View" : "Focus Mode")}
    </Button>
  );
}
