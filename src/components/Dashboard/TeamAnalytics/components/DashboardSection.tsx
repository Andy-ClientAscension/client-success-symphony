
import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
  onToggle?: (id: string, isOpen: boolean) => void;
  onRemove?: (id: string) => void;
  removable?: boolean;
}

export function DashboardSection({ 
  title, 
  children, 
  defaultOpen = false, 
  id = "", 
  onToggle, 
  onRemove,
  removable = false
}: DashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (id && onToggle) {
      onToggle(id, open);
    }
  };
  
  const handleRemove = () => {
    if (id && onRemove) {
      onRemove(id);
    }
  };

  return (
    <Collapsible 
      defaultOpen={defaultOpen} 
      open={isOpen}
      onOpenChange={handleToggle}
      className="border border-border/30 rounded-lg p-4 mb-4 bg-card shadow-sm"
    >
      <div className="flex items-center justify-between pb-4">
        <span className="text-base font-semibold">{title}</span>
        <div className="flex items-center gap-2">
          {removable && onRemove && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemove}
              className="text-xs font-medium space-x-1 rounded px-2 py-1 hover:bg-red-100 hover:text-red-600 transition"
              aria-label={`Remove ${title} section`}
            >
              Remove
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs font-medium space-x-1 rounded px-2 py-1 hover:bg-muted transition"
            >
              <span>{isOpen ? "Hide Details" : "Show Details"}</span>
              {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
