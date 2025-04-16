
import { useState, useRef, useEffect } from "react";
import { Bot, Sparkles, Send, X, Loader2, Settings, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AIAutomationSuggestions } from "./AIAutomationSuggestions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { generateAIResponse, saveOpenAIKey, getOpenAIKey, hasOpenAIKey } from "@/lib/openai";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant powered by GPT-4o-mini. I can help analyze client data, generate reports, and automate routine tasks. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Check for API key on component mount
    if (isOpen && !hasOpenAIKey()) {
      setShowApiKeyDialog(true);
    }
    
    // Load saved API key if it exists
    const savedKey = getOpenAIKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveOpenAIKey(apiKey.trim());
      setShowApiKeyDialog(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved.",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Check if API key exists
      if (!hasOpenAIKey()) {
        setShowApiKeyDialog(true);
        setIsLoading(false);
        return;
      }

      // Format message history for API
      const messageHistory = messages.concat(userMessage).map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }));
      
      // Add system message at the beginning
      messageHistory.unshift({
        role: "system",
        content: "You are an AI assistant for a client management system. Help users analyze client data, generate reports, and suggest automations. Be concise and helpful."
      });

      // Call OpenAI API
      const response = await generateAIResponse(messageHistory, getOpenAIKey());
      
      // Add AI response
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      toast({
        title: "AI Assistant Response",
        description: "New insights are available from your AI assistant",
      });
    } catch (error) {
      console.error("Error processing AI response:", error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 rounded-full h-14 w-14 p-0 shadow-lg"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
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
            <div className="flex-grow overflow-y-auto p-3 space-y-3">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      message.role === 'user' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t">
              <AIAutomationSuggestions onSelectSuggestion={(suggestion) => setInput(suggestion)} />
              
              <div className="flex mt-2">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="resize-none min-h-[60px]"
                  disabled={isLoading}
                />
                <Button 
                  className="ml-2 bg-red-600 hover:bg-red-700 self-end"
                  disabled={isLoading || !input.trim()}
                  onClick={handleSendMessage}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter OpenAI API Key</DialogTitle>
            <DialogDescription>
              Enter your OpenAI API key to power the AI assistant. Your key is stored locally in your browser and never sent to our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right col-span-1">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="col-span-3"
              />
            </div>
            <div className="text-sm text-gray-500 col-span-4">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline text-blue-600">OpenAI's dashboard</a>. This application uses gpt-4o-mini which is cost-effective.
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
              Save Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
