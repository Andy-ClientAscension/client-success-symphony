import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GoogleFormIntegration() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const { toast } = useToast();

  const formTemplate = `1. Go to Google Forms (forms.google.com)
2. Create a new form titled "Student Onboarding"
3. Add these required fields:
   - Name (Short answer)
   - Email (Short answer)
   - Phone (Short answer)
   - Program/Service (Multiple choice)
   - Preferred Team (Multiple choice)
   - Start Date (Date)

4. In form settings, enable "Collect email addresses"
5. Set up response notifications to your email`;

  const zapierInstructions = `1. Go to Zapier.com and create a new Zap
2. Choose "Google Forms" as trigger
3. Select "New Response in Spreadsheet" 
4. Connect your Google account and select your form
5. For the action, choose "Webhooks by Zapier"
6. Select "POST" method
7. Use this URL as the webhook endpoint:
   ${window.location.origin}/api/students/webhook
8. Map the form fields to the webhook payload
9. Test and activate your Zap`;

  const copyInstructions = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Instructions Copied",
      description: "Setup instructions have been copied to your clipboard",
    });
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive"
      });
      return;
    }

    // Save webhook URL to local storage
    localStorage.setItem('student_webhook_url', webhookUrl);
    setIsSetup(true);
    
    toast({
      title: "Webhook Saved",
      description: "Your webhook URL has been saved successfully",
    });
  };

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Google Form Integration Setup</DialogTitle>
        <DialogDescription>
          Connect your Google Form to automatically add students when they complete onboarding
        </DialogDescription>
      </DialogHeader>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="form-setup">Form Setup</TabsTrigger>
          <TabsTrigger value="zapier">Automation</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Setup
                </CardTitle>
                <CardDescription>Follow these steps to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Create Google Form</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Set up Zapier automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Configure webhook endpoint</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Test integration</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
                <CardDescription>What you'll get with this integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Automatic student enrollment</p>
                <p>• Consistent data collection</p>
                <p>• Reduced manual data entry</p>
                <p>• Real-time student onboarding</p>
                <p>• Standardized information gathering</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Flow</CardTitle>
              <CardDescription>How student data flows from form to dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-lg">📝</span>
                  </div>
                  <p>Student fills form</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-lg">⚡</span>
                  </div>
                  <p>Zapier triggers</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-lg">🎯</span>
                  </div>
                  <p>Webhook called</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-lg">📊</span>
                  </div>
                  <p>Student added</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form-setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Form Setup</CardTitle>
              <CardDescription>Create your student onboarding form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Form Template</h4>
                <pre className="text-sm whitespace-pre-line text-muted-foreground">
                  {formTemplate}
                </pre>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInstructions(formTemplate)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Instructions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://forms.google.com', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Google Forms
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recommended Form Fields</Label>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between p-2 border rounded">
                    <span>Student Name</span>
                    <span className="text-green-600">Required</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>Email Address</span>
                    <span className="text-green-600">Required</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>Phone Number</span>
                    <span className="text-blue-600">Recommended</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>Program/Service</span>
                    <span className="text-blue-600">Recommended</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>Preferred Team</span>
                    <span className="text-gray-600">Optional</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>Start Date</span>
                    <span className="text-blue-600">Recommended</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zapier Automation</CardTitle>
              <CardDescription>Connect your form to the webhook</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Zapier Setup Instructions</h4>
                <pre className="text-sm whitespace-pre-line text-muted-foreground">
                  {zapierInstructions}
                </pre>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInstructions(zapierInstructions)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Instructions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://zapier.com', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Zapier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Set up the endpoint for receiving student data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-webhook-endpoint.com"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This is where Zapier will send the form data. You can use services like Zapier Webhooks, Make.com, or your own endpoint.
                </p>
              </div>

              {isSetup && (
                <div className="bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Webhook Configured</span>
                  </div>
                  <p className="text-sm mt-1">Your webhook URL has been saved and is ready to receive student data.</p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Expected Payload Format</h4>
                <pre className="text-xs text-muted-foreground bg-white dark:bg-gray-800 p-2 rounded border overflow-x-auto">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "service": "Backend Development",
  "team": "Team A",
  "startDate": "2024-01-15"
}`}
                </pre>
              </div>

              <Button onClick={handleSaveWebhook} className="w-full">
                Save Webhook Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}