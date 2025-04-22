
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accessibility, ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import { announceToScreenReader } from '@/lib/accessibility';

export function AccessibilityHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    navigation: true,
    keyboard: false,
    screen: false,
    forms: false,
  });

  useEffect(() => {
    // Setup Alt+A keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      announceToScreenReader('Accessibility help dialog opened. Press Escape to close.');
    }
  }, [isOpen]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full p-2.5 shadow-md"
        aria-label="Accessibility Help"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Accessibility Help</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-lg"
          aria-labelledby="accessibility-help-title"
        >
          <DialogHeader>
            <DialogTitle id="accessibility-help-title" className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" aria-hidden="true" />
              Accessibility Help
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4 my-4">
            <div className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                <button
                  onClick={() => toggleSection('navigation')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 text-left font-medium"
                  aria-expanded={expandedSections.navigation}
                  aria-controls="navigation-section"
                >
                  <span>Dashboard Navigation</span>
                  {expandedSections.navigation ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {expandedSections.navigation && (
                  <div id="navigation-section" className="px-4 py-3 border-t">
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Use Tab key to navigate between interactive elements</li>
                      <li>Use skip links at the top of the page to jump to main content</li>
                      <li>The main dashboard is divided into sections with clear headings</li>
                      <li>Press Alt+1 to quickly access dashboard overview</li>
                      <li>Press Alt+2 to quickly access client listings</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="border rounded-md overflow-hidden">
                <button
                  onClick={() => toggleSection('keyboard')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 text-left font-medium"
                  aria-expanded={expandedSections.keyboard}
                  aria-controls="keyboard-section"
                >
                  <span>Keyboard Shortcuts</span>
                  {expandedSections.keyboard ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {expandedSections.keyboard && (
                  <div id="keyboard-section" className="px-4 py-3 border-t">
                    <ul className="space-y-2 text-sm">
                      {[
                        { key: 'Tab', desc: 'Move to next focusable element' },
                        { key: 'Shift + Tab', desc: 'Move to previous focusable element' },
                        { key: 'Enter/Space', desc: 'Activate buttons and controls' },
                        { key: 'Esc', desc: 'Close dialogs or cancel operations' },
                        { key: 'Alt + A', desc: 'Open this accessibility help' },
                        { key: 'Alt + 1-5', desc: 'Quick navigation to main sections' },
                        { key: 'Arrow keys', desc: 'Navigate within components' },
                      ].map(({ key, desc }) => (
                        <li key={key} className="flex">
                          <kbd className="inline-flex items-center justify-center h-6 min-w-[60px] px-2 rounded bg-muted text-xs font-medium mr-3">
                            {key}
                          </kbd>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border rounded-md overflow-hidden">
                <button
                  onClick={() => toggleSection('screen')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 text-left font-medium"
                  aria-expanded={expandedSections.screen}
                  aria-controls="screen-section"
                >
                  <span>Screen Reader Support</span>
                  {expandedSections.screen ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {expandedSections.screen && (
                  <div id="screen-section" className="px-4 py-3 border-t">
                    <p className="text-sm mb-3">
                      This dashboard is optimized for screen readers with the following features:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>ARIA landmarks for easy navigation</li>
                      <li>Live regions announce dynamic content changes</li>
                      <li>Proper heading hierarchy for navigation</li>
                      <li>All interactive elements have accessible names</li>
                      <li>Images and icons include alternative text</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="border rounded-md overflow-hidden">
                <button
                  onClick={() => toggleSection('forms')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 text-left font-medium"
                  aria-expanded={expandedSections.forms}
                  aria-controls="forms-section"
                >
                  <span>Form Controls & Interactive Elements</span>
                  {expandedSections.forms ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {expandedSections.forms && (
                  <div id="forms-section" className="px-4 py-3 border-t">
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>All form controls have associated labels</li>
                      <li>Error messages are announced to screen readers</li>
                      <li>Required fields are properly indicated</li>
                      <li>Focus is managed to help with form completion</li>
                      <li>Interactive elements have visible focus indicators</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md mt-4">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Need Additional Help?</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    If you need further assistance with accessibility features, please contact support at support@example.com or call (555) 123-4567.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
