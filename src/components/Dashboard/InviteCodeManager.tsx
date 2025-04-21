
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";

export function InviteCodeManager() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const { toast } = useToast();

  const generateInviteCode = () => {
    // Generate a random code with timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newCode = `${timestamp}${randomStr}`;
    
    // Update the valid codes list (you would typically do this through an API)
    const existingCodes = JSON.parse(localStorage.getItem('validInviteCodes') || '[]');
    localStorage.setItem('validInviteCodes', JSON.stringify([...existingCodes, newCode]));
    
    setGeneratedCode(newCode);
    toast({
      title: "Invite Code Generated",
      description: "New one-time use code has been created.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Invitation Codes
        </CardTitle>
        <CardDescription>Generate one-time use invitation codes for new users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={generateInviteCode} className="flex-shrink-0">
            Generate New Code
          </Button>
          {generatedCode && (
            <div className="flex gap-2 flex-grow">
              <Input value={generatedCode} readOnly className="flex-grow" />
              <Button variant="outline" onClick={copyToClipboard}>
                Copy
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
