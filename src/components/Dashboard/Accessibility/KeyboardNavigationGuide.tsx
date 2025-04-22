
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle, Keyboard, X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { focusRingClasses } from "@/lib/accessibility";

export function KeyboardNavigationGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Tab', description: 'Move to next focusable element' },
    { key: 'Shift + Tab', description: 'Move to previous focusable element' },
    { key: 'Space / Enter', description: 'Activate buttons, links, and toggle inputs' },
    { key: 'Esc', description: 'Close dialogs or cancel current operation' },
    { key: 'Arrow Keys', description: 'Navigate within components like tabs or data tables' },
    { key: 'Home', description: 'Go to beginning of current section' },
    { key: 'End', description: 'Go to end of current section' },
    { key: 'Alt + 1-9', description: 'Quick access to main dashboard sections' },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className={`h-8 px-2 flex items-center gap-1.5 ${focusRingClasses}`}
          aria-label="Keyboard shortcuts and accessibility information"
        >
          <Keyboard className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only md:not-sr-only">Keyboard Shortcuts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80" 
        align="end"
        role="dialog"
        aria-label="Keyboard navigation shortcuts"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center gap-1.5">
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            Keyboard Shortcuts
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full" 
            onClick={() => setIsOpen(false)}
            aria-label="Close keyboard shortcuts guide"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use these keyboard shortcuts to navigate the dashboard more efficiently:
            </p>
            <ul className="space-y-2 text-sm">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.key} className="flex items-start">
                  <kbd className="px-2 py-1 mr-2 min-w-[80px] inline-flex items-center justify-center rounded bg-muted text-xs font-medium">
                    {shortcut.key}
                  </kbd>
                  <span>{shortcut.description}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Need Assistance?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Alt + A</kbd> at any time to activate screen reader help mode.
              </p>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
