
import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, LineChart, Brain, Sparkles, Wand2, ArrowRight, MessageSquare, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { getAllClients } from "@/lib/data";

export default function AIDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("insights");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  const clients = getAllClients();
  
  const form = useForm({
    defaultValues: {
      analysisType: "health",
      timeFrame: "last30days",
      clientSegment: "all"
    }
  });

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setGeneratedContent(
        "## Client Health Analysis\n\n" +
        "Based on the analysis of client data over the past 30 days, here are the key insights:\n\n" +
        "1. **At-Risk Clients**: 3 clients show declining engagement patterns\n" +
        "2. **Growth Opportunities**: 5 clients have increased their usage by >20%\n" +
        "3. **Churn Prediction**: 2 clients have a >60% probability of churning\n\n" +
        "### Recommended Actions:\n" +
        "- Schedule check-in calls with the at-risk clients\n" +
        "- Prepare upsell proposals for growth-ready clients\n" +
        "- Implement automated renewal reminders for all clients"
      );
      setIsGenerating(false);
      
      toast({
        title: "Analysis Complete",
        description: "AI has generated new insights for your client data",
      });
    }, 2000);
  };
  
  const handleGenerateEmail = () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setGeneratedContent(
        "Subject: Your Quarterly Business Review - Insights and Growth Opportunities\n\n" +
        "Dear [Client Name],\n\n" +
        "I hope this email finds you well. I wanted to reach out to share some insights from our analysis of your account activity over the past quarter.\n\n" +
        "We've noticed some positive trends in your usage patterns, particularly in the following areas:\n\n" +
        "• 23% increase in team member engagement\n" +
        "• 15% improvement in workflow efficiency metrics\n" +
        "• Successful implementation of 3 new automation workflows\n\n" +
        "I'd love to schedule a brief call to discuss how we can further optimize your experience and explore additional features that align with your growth objectives.\n\n" +
        "Would you be available for a 30-minute call next week? Please let me know what times work best for you.\n\n" +
        "Best regards,\n" +
        "[Your Name]"
      );
      setIsGenerating(false);
      
      toast({
        title: "Email Draft Ready",
        description: "AI has generated an email template for client outreach",
      });
    }, 1800);
  };

  return (
    <Layout>
      <div className="w-full p-4 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl font-bold">AI Automation Center</h1>
            <p className="text-muted-foreground">
              Leverage AI to analyze data, generate content, and automate workflows
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0">
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
            >
              <FileText className="h-4 w-4 mr-2" />
              Content Generation
            </TabsTrigger>
            <TabsTrigger 
              value="automations" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-4 py-2 bg-transparent"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Smart Automations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-red-600" />
                    AI Data Analysis
                  </CardTitle>
                  <CardDescription>
                    Generate insights from your client data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="analysisType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Analysis Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select analysis type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="health">Client Health Analysis</SelectItem>
                                <SelectItem value="churn">Churn Prediction</SelectItem>
                                <SelectItem value="revenue">Revenue Optimization</SelectItem>
                                <SelectItem value="engagement">Engagement Patterns</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="timeFrame"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Frame</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time period" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="last7days">Last 7 Days</SelectItem>
                                <SelectItem value="last30days">Last 30 Days</SelectItem>
                                <SelectItem value="last90days">Last Quarter</SelectItem>
                                <SelectItem value="lastyear">Last Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="clientSegment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Segment</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select client segment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">All Clients</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                <SelectItem value="midmarket">Mid-Market</SelectItem>
                                <SelectItem value="smb">Small Business</SelectItem>
                                <SelectItem value="atrisk">At-Risk Clients</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={handleGenerateInsights}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>Generating Insights...</>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI Insights
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Generated Insights</CardTitle>
                  <CardDescription>
                    View AI-generated analysis and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="whitespace-pre-line bg-gray-50 p-4 rounded-md border text-sm h-[350px] overflow-y-auto">
                      {generatedContent}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[350px] bg-gray-50 p-4 rounded-md border">
                      <Bot className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 text-center">
                        Configure your analysis parameters and click "Generate AI Insights" to see results
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
                    AI Content Generator
                  </CardTitle>
                  <CardDescription>
                    Create client communications and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Content Type</FormLabel>
                      <Select defaultValue="email">
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Client Email</SelectItem>
                          <SelectItem value="report">Status Report</SelectItem>
                          <SelectItem value="proposal">Renewal Proposal</SelectItem>
                          <SelectItem value="social">Social Media Post</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel>Client</FormLabel>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Generic Template</SelectItem>
                          {clients.slice(0, 5).map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel>Content Focus</FormLabel>
                      <Select defaultValue="performance">
                        <SelectTrigger>
                          <SelectValue placeholder="Select focus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance Review</SelectItem>
                          <SelectItem value="upsell">Upsell Opportunity</SelectItem>
                          <SelectItem value="checkin">Regular Check-in</SelectItem>
                          <SelectItem value="renewal">Renewal Discussion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={handleGenerateEmail}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>Generating Content...</>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                  <CardDescription>
                    Review and edit the AI-generated content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <Textarea 
                      className="h-[350px] font-mono text-sm"
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[350px] bg-gray-50 p-4 rounded-md border">
                      <FileText className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 text-center">
                        Select your content parameters and click "Generate Content" to create a draft
                      </p>
                    </div>
                  )}
                  
                  {generatedContent && (
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Content Copied",
                          description: "The generated content has been copied to clipboard",
                        });
                      }}>
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Content Saved",
                          description: "The generated content has been saved to drafts",
                        });
                      }}>
                        Save Draft
                      </Button>
                      <Button size="sm" onClick={() => {
                        toast({
                          title: "Email Sent",
                          description: "Your message has been scheduled for delivery",
                        });
                      }}>
                        Send Email
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="automations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                    Smart Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                      <div className="font-medium">Client Onboarding Automation</div>
                      <p className="text-sm text-muted-foreground mb-2">Automate welcome emails, setup guides and follow-ups</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => {
                          toast({
                            title: "Workflow Enabled",
                            description: "Client onboarding automation has been enabled",
                          });
                        }}
                      >
                        Enable <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-green-50 border border-green-100 rounded-md p-3">
                      <div className="font-medium">Health Score Monitoring</div>
                      <p className="text-sm text-muted-foreground mb-2">Auto-detect client health changes and trigger alerts</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => {
                          toast({
                            title: "Workflow Enabled",
                            description: "Health score monitoring has been enabled",
                          });
                        }}
                      >
                        Enable <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                      <div className="font-medium">Renewal Management</div>
                      <p className="text-sm text-muted-foreground mb-2">Schedule renewal touchpoints and proposals</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => {
                          toast({
                            title: "Workflow Enabled",
                            description: "Renewal management has been enabled",
                          });
                        }}
                      >
                        Enable <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-purple-500" />
                    Predictive Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-purple-50 border border-purple-100 rounded-md p-3">
                      <div className="font-medium">Churn Prediction</div>
                      <p className="text-sm text-muted-foreground mb-2">Identify clients at risk of churning before it happens</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => {
                          toast({
                            title: "Model Enabled",
                            description: "Churn prediction model has been activated",
                          });
                        }}
                      >
                        Enable <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3">
                      <div className="font-medium">Revenue Forecasting</div>
                      <p className="text-sm text-muted-foreground mb-2">Predict future revenue based on client patterns</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => {
                          toast({
                            title: "Model Enabled",
                            description: "Revenue forecasting has been activated",
                          });
                        }}
                      >
                        Enable <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-red-50 border border-red-100 rounded-md p-3">
                      <div className="font-medium">Engagement Analysis</div>
                      <p className="text-sm text-muted-foreground mb-2">Predict client engagement and usage patterns</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => {
                          toast({
                            title: "Model Enabled",
                            description: "Engagement analysis has been activated",
                          });
                        }}
                      >
                        Enable <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-red-600" />
                    AI Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <FormLabel>AI Model</FormLabel>
                      <Select defaultValue="standard">
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (Default)</SelectItem>
                          <SelectItem value="advanced">Advanced Analytics</SelectItem>
                          <SelectItem value="specialized">Industry Specialized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel>API Key</FormLabel>
                      <Input type="password" value="sk-••••••••••••••••••••••" />
                      <p className="text-xs text-muted-foreground mt-1">Using default model. Add custom API key for advanced features.</p>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          toast({
                            title: "AI Configuration Updated",
                            description: "Your AI settings have been saved",
                          });
                        }}
                      >
                        Save Configuration
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
