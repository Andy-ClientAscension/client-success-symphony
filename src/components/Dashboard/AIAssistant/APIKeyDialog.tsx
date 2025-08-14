
import { useState } from "react";
import { Loader2, CheckCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateAIResponse, saveOpenAIKey, OpenAIMessage } from "@/lib/openai";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface APIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const APIKeyDialog = ({ open, onOpenChange, apiKey, setApiKey }: APIKeyDialogProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveOpenAIKey(apiKey.trim());
      onOpenChange(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenRouter API key has been saved.",
      });
      setApiKeyValid(null); // Reset validation state when new key is saved
    }
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsTesting(true);
    
    try {
      const testMessage: OpenAIMessage[] = [
        {
          role: "system",
          content: "This is a test message to validate the API key."
        },
        {
          role: "user",
          content: "Hello, is this API key working?"
        }
      ];
      
      const response = await generateAIResponse(testMessage, apiKey);
      
      if (response.includes("Error:")) {
        setApiKeyValid(false);
        toast({
          title: "API Key Invalid",
          description: response,
          variant: "destructive",
        });
      } else {
        setApiKeyValid(true);
        toast({
          title: "API Key Valid",
          description: "Your OpenRouter API key is working correctly!",
        });
      }
    } catch (error) {
      setApiKeyValid(false);
      toast({
        title: "API Key Test Failed",
        description: "Failed to test API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter OpenRouter API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenRouter API key to power the AI assistant. Your key is stored locally in your browser and never sent to our servers.
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
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline"
              onClick={testApiKey}
              disabled={isTesting || !apiKey.trim()}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                apiKeyValid === true ? <CheckCircle className="h-4 w-4 text-green-500" /> : null
              )}
              Test Key
            </Button>
          </div>
          {apiKeyValid === true && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              API key is valid and working correctly.
            </div>
          )}
          {apiKeyValid === false && (
            <div className="text-sm text-red-600">
              API key validation failed. Please check your key and try again.
            </div>
          )}
          <div className="text-sm text-gray-500 col-span-4">
            Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline text-blue-600">OpenRouter's dashboard</a>. This application uses gpt-5-mini which is fast and cost-effective.
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
            Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
