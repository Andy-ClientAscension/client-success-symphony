import { useState, useEffect, useRef } from "react";
import { Bot, X, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getOpenAIKey, hasOpenAIKey } from "@/lib/openai";
import { useSystemHealth } from '@/hooks/use-system-health';
import { Message, SystemHealthCheck } from "./types";
import { AIMessageList } from "./AIMessageList";
import { APIKeyDialog } from "./APIKeyDialog";
import { SystemHealthAlert } from "./SystemHealthAlert";
import { AIMessageInput } from "./AIMessageInput";
import { AIAssistantContent } from "./AIAssistantContent";

export function AIAssistantContainer() {
  const { healthChecks } = useSystemHealth();
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (isOpen && !hasOpenAIKey()) {
      setShowApiKeyDialog(true);
    }
    
    const savedKey = getOpenAIKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => ({
      ...prev,
      [id]: true
    }));
    
    // Store dismissed alerts in localStorage to persist across sessions
    try {
      const storedDismissed = JSON.parse(localStorage.getItem('dismissedHealthAlerts') || '{}');
      storedDismissed[id] = true;
      localStorage.setItem('dismissedHealthAlerts', JSON.stringify(storedDismissed));
    } catch (e) {
      console.error("Error storing dismissed alerts:", e);
    }
  };

  // Load dismissed alerts from localStorage
  useEffect(() => {
    try {
      const storedDismissed = JSON.parse(localStorage.getItem('dismissedHealthAlerts') || '{}');
      setDismissedAlerts(storedDismissed);
    } catch (e) {
      console.error("Error loading dismissed alerts:", e);
    }
  }, []);

  // Get count of non-dismissed high priority alerts
  const activeHighPriorityAlerts = healthChecks.filter(
    check => check.severity === 'high' && !dismissedAlerts[check.id || check.message]
  ).length;

  return (
    <>
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 rounded-full h-14 w-14 p-0 shadow-lg"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
          {activeHighPriorityAlerts > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {activeHighPriorityAlerts}
            </span>
          )}
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 shadow-xl border-red-100 z-50 max-h-[70vh] flex flex-col">
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bot className="h-4 w-4 mr-2 text-red-600" />
              AI Assistant
              <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-600 border-red-200">
                GPT-4o-mini
              </Badge>
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setShowApiKeyDialog(true)}
                aria-label="API Settings"
              >
                <Key className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
            {/* Show active health alerts at the top if there are any */}
            {healthChecks.filter(check => 
              check.severity === 'high' && !dismissedAlerts[check.id || check.message]
            ).length > 0 && (
              <div className="p-3 border-b bg-amber-50/30">
                {healthChecks
                  .filter(check => check.severity === 'high' && !dismissedAlerts[check.id || check.message])
                  .map((check, idx) => (
                    <SystemHealthAlert 
                      key={check.id || `${check.message}-${idx}`}
                      healthCheck={check}
                      onDismiss={() => dismissAlert(check.id || check.message)}
                    />
                  ))
                }
              </div>
            )}
            
            <AIAssistantContent
              isOpen={isOpen}
              dismissedAlerts={dismissedAlerts}
            />
          </CardContent>
        </Card>
      )}

      <APIKeyDialog 
        open={showApiKeyDialog} 
        onOpenChange={setShowApiKeyDialog} 
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </>
  );
}
