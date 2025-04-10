
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Link, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { availableApiServices, validateApiKey, saveApiSettings } from "@/lib/api";

interface APIConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function APIConnectionDialog({ open, onOpenChange }: APIConnectionDialogProps) {
  const [apiType, setApiType] = useState("select");
  const [apiKey, setApiKey] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const { toast } = useToast();

  const handleConnect = async () => {
    if (apiType === "select") {
      toast({
        title: "Missing Selection",
        description: "Please select an API type to connect",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus("connecting");

    try {
      // Validate the API key
      const isValid = await validateApiKey(apiType, apiKey);
      
      if (isValid) {
        // Save the API connection
        saveApiSettings(apiType, apiKey);
        setConnectionStatus("success");
        
        toast({
          title: "API Connected",
          description: `Successfully connected to ${getAPIDisplayName(apiType)}`,
        });
        
        // Reset form after short delay
        setTimeout(() => {
          setApiKey("");
          setApiType("select");
          setConnectionStatus("idle");
          onOpenChange(false);
        }, 1500);
      } else {
        throw new Error("Invalid API key");
      }
    } catch (error) {
      console.error("API connection error:", error);
      setConnectionStatus("error");
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the API. Please check your key and try again.",
        variant: "destructive",
      });
    }
  };

  const getAPIDisplayName = (apiTypeValue: string): string => {
    const apiService = availableApiServices.find(service => service.id === apiTypeValue);
    return apiService ? apiService.name : apiTypeValue;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Connect External API
          </DialogTitle>
          <DialogDescription>
            Connect to an external service API to enhance your client dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-type" className="text-right">
              API Type
            </Label>
            <Select 
              value={apiType} 
              onValueChange={setApiType}
              disabled={connectionStatus === "connecting"}
            >
              <SelectTrigger id="api-type" className="col-span-3">
                <SelectValue placeholder="Select API type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="select" disabled>Select API type</SelectItem>
                {availableApiServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={connectionStatus === "connecting" || apiType === "select"}
              placeholder="Enter your API key"
              className="col-span-3"
            />
          </div>
          
          {connectionStatus === "success" && (
            <div className="flex items-center justify-center text-green-600 gap-2 my-2">
              <CheckCircle className="h-5 w-5" />
              <span>Connection successful!</span>
            </div>
          )}
          
          {connectionStatus === "error" && (
            <div className="flex items-center justify-center text-red-600 gap-2 my-2">
              <AlertCircle className="h-5 w-5" />
              <span>Connection failed. Please try again.</span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={connectionStatus === "connecting"}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            disabled={connectionStatus === "connecting" || apiType === "select" || !apiKey.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {connectionStatus === "connecting" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
