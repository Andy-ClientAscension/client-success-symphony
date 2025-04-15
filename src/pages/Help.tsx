
import { Layout } from "@/components/Layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  AlertCircle, 
  ChevronDown, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  Link as LinkIcon, 
  Phone, 
  Search, 
  Users,
  LayoutDashboard,
  FileBarChart,
  ClipboardList,
  Bell,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart,
  Bug,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ValidationError } from "@/components/ValidationError";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ResourceLink {
  id: string;
  title: string;
  url: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  links: ResourceLink[];
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customLink, setCustomLink] = useState("");

  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([
    {
      id: "call-links",
      title: "Call Links",
      icon: Phone,
      links: [
        { id: "call-1", title: "Weekly Team Call", url: "https://zoom.us/j/example" },
        { id: "call-2", title: "Client Support Line", url: "https://meet.google.com/example" }
      ]
    },
    {
      id: "referral-links",
      title: "Referral Links",
      icon: Users,
      links: [
        { id: "referral-1", title: "Partner Referral Program", url: "https://example.com/referral" }
      ]
    },
    {
      id: "ssc-documents",
      title: "SSC Documents",
      icon: FileText,
      links: [
        { id: "doc-1", title: "Client Onboarding Guide", url: "https://example.com/docs/onboarding" },
        { id: "doc-2", title: "Support Documentation", url: "https://example.com/docs/support" }
      ]
    },
    {
      id: "stripe-links",
      title: "Stripe Links",
      icon: ExternalLink,
      links: [
        { id: "stripe-1", title: "Payment Dashboard", url: "https://dashboard.stripe.com" },
        { id: "stripe-2", title: "Invoicing Portal", url: "https://billing.stripe.com" }
      ]
    }
  ]);

  const troubleshootingItems = [
    {
      id: "connection-issues",
      title: "Connection Issues",
      symptom: "The application fails to load data or displays offline errors.",
      solution: "Check your internet connection. Try refreshing the page or clearing your browser cache. If the problem persists, it may be an issue with our servers - please check our status page or contact support."
    },
    {
      id: "data-sync",
      title: "Data Not Syncing",
      symptom: "Changes you make aren't being saved or aren't appearing across devices.",
      solution: "Ensure you have a stable internet connection. Try refreshing the page. If you're working offline, data will sync once you reconnect to the internet. If problems persist, try logging out and back in."
    },
    {
      id: "dashboard-loading",
      title: "Dashboard Won't Load",
      symptom: "The dashboard screen appears blank or shows a loading indicator indefinitely.",
      solution: "This could be due to a large amount of data or slow connection. Try refreshing the page, clearing your browser cache, or temporarily switching to a different view and then back to the dashboard."
    },
    {
      id: "client-data",
      title: "Can't Add or Edit Client Data",
      symptom: "Form submissions fail or data doesn't save when adding or editing clients.",
      solution: "Ensure all required fields are filled out correctly. Check for error messages that might indicate specific issues. If using special characters, ensure they're supported by the system. Try a different browser if problems persist."
    },
    {
      id: "report-generation",
      title: "Analytics Reports Not Generating",
      symptom: "Unable to generate or view reports in the Analytics section.",
      solution: "Check if there is sufficient data to generate the requested report. Some reports require a minimum amount of data. Try selecting a different date range or client filter. If issues persist, try clearing your browser cache."
    },
    {
      id: "browser-compatibility",
      title: "Browser Compatibility Issues",
      symptom: "Certain features don't work as expected in your browser.",
      solution: "We recommend using the latest version of Chrome, Firefox, Safari, or Edge. Some features may not work correctly in older browsers or less common browsers. Try updating your browser or switching to a supported one."
    },
    {
      id: "kanban-board-issues",
      title: "Kanban Board Not Updating",
      symptom: "Student cards don't move between columns or changes aren't saved.",
      solution: "Make sure Auto-save is enabled in the dashboard preferences. Try refreshing the page after making changes. If the issue persists, try disabling Performance Mode temporarily in the dashboard settings."
    },
    {
      id: "health-score-calculation",
      title: "Health Score Calculation Issues",
      symptom: "Client health scores appear incorrect or aren't updating correctly.",
      solution: "Health scores are calculated based on several factors including activity, engagement, and renewal status. Ensure all client metrics are up to date. If scores still seem incorrect, try updating client metrics manually."
    },
    {
      id: "chart-display-problems",
      title: "Charts Not Rendering Correctly",
      symptom: "Analytics charts appear blank, show errors, or display incorrect data.",
      solution: "Try switching between different chart types. Ensure your browser is up to date. If using dark mode, try switching to light mode temporarily to see if the issue persists. For incorrect data, check that the date filters are set correctly."
    },
    {
      id: "task-manager-issues",
      title: "Task Manager Not Working",
      symptom: "Unable to add tasks, tasks disappear, or task completion status doesn't update.",
      solution: "Refresh the page and try again. If tasks are disappearing, check if they are being automatically archived after completion. For tasks that won't mark as complete, try reassigning the task to yourself or another team member."
    }
  ];

  const dashboardGuides = [
    {
      id: "overview-guide",
      title: "Dashboard Overview",
      icon: LayoutDashboard,
      content: "The main dashboard is designed as a unified control center for client success managers. It displays key metrics, client health status, upcoming renewals, and task management all in one view. Use the top navigation tabs to switch between different dashboard sections: Overview, Tasks, Automations, and Advanced Analytics."
    },
    {
      id: "performance-mode",
      title: "Performance Mode",
      icon: Zap,
      content: "Performance Mode optimizes the dashboard for speed by moving resource-intensive components like the Client List and Kanban Board to their own dedicated pages. Enable this mode using the toggle in the dashboard header when working with large amounts of data or on less powerful devices."
    },
    {
      id: "client-management",
      title: "Client Management",
      icon: Users,
      content: "The Clients page offers multiple ways to view and manage client data: a filterable list, team health analytics, and a student tracking board. Use the tabs at the top to switch between these views. The client list supports bulk actions, allowing you to update the status or team assignment for multiple clients at once."
    },
    {
      id: "health-scores",
      title: "Health Score System",
      icon: BarChart,
      content: "Client health scores are calculated based on a proprietary algorithm that considers engagement, payment status, meeting attendance, and renewal likelihood. Scores range from 0-100, with higher scores indicating healthier client relationships. The Health Score Dashboard provides detailed breakdowns of these factors."
    },
    {
      id: "backend-sales",
      title: "Backend Sales Tracking",
      icon: FileBarChart,
      content: "The Backend Sales Tracker monitors client renewals and churn. It allows you to record the outcome of renewal conversations, identify common reasons for churn, and track renewal rates across different teams. Access comprehensive analytics in the Renewals tab."
    },
    {
      id: "kanban-system",
      title: "Student Tracking System",
      icon: ClipboardList,
      content: "The Kanban board provides a visual way to track student progress through different stages. Drag and drop student cards between columns to update their status. Each card displays key information about the student, and clicking on a card reveals more detailed options."
    },
    {
      id: "automation",
      title: "Automation Features",
      icon: Zap,
      content: "The Automations tab allows you to set up workflows that trigger based on client events or status changes. You can configure integrations with external services like Zapier, Make, and Kajabi to automate repetitive tasks and ensure timely client communication."
    }
  ];
  
  const commonScenarios = [
    {
      id: "scenario-1",
      title: "New Client Onboarding",
      steps: [
        "Add the new client using the 'Add New Client' button on the Clients page",
        "Assign the client to the appropriate team member",
        "Set up initial health score metrics",
        "Create onboarding tasks in the Task Manager",
        "Schedule the first check-in call using the client details page"
      ]
    },
    {
      id: "scenario-2",
      title: "Monitoring At-Risk Clients",
      steps: [
        "Check the Health Score Dashboard to identify clients with declining scores",
        "Filter the Client List to show only 'At Risk' clients",
        "Review individual client activity and notes",
        "Create intervention tasks for the assigned team member",
        "Schedule a check-in call to address concerns"
      ]
    },
    {
      id: "scenario-3",
      title: "Handling Renewals",
      steps: [
        "Use the Upcoming Renewals widget to see clients due for renewal",
        "Review client health and engagement metrics before the renewal conversation",
        "Record the outcome in the Backend Sales Tracker",
        "If renewed, update the renewal date and client status",
        "If churned, document the reasons for churn to improve retention strategies"
      ]
    },
    {
      id: "scenario-4",
      title: "Team Performance Review",
      steps: [
        "View the Team Analytics section to see aggregated performance metrics",
        "Analyze renewal rates and health scores by team",
        "Identify top performers and potential areas for improvement",
        "Review the churn reasons analysis to spot trends",
        "Use the SSC Performance Table for detailed individual metrics"
      ]
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = [
      ...troubleshootingItems
        .filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.symptom.toLowerCase().includes(query) || 
          item.solution.toLowerCase().includes(query)
        )
        .map(item => item.id),
      ...dashboardGuides
        .filter(guide => 
          guide.title.toLowerCase().includes(query) || 
          guide.content.toLowerCase().includes(query)
        )
        .map(guide => guide.id)
    ];
    
    setSearchResults(results);
    
    const newExpanded: Record<string, boolean> = {};
    results.forEach(id => {
      newExpanded[id] = true;
    });
    setExpanded(newExpanded);
  };

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim() || !selectedCategory) {
      return;
    }

    const newLink: ResourceLink = {
      id: `${selectedCategory}-${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl
    };

    setResourceCategories(categories => 
      categories.map(category => 
        category.id === selectedCategory 
          ? { ...category, links: [...category.links, newLink] } 
          : category
      )
    );

    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const handleAddCustomLink = () => {
    if (!customLink.trim()) return;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(customLink, 'text/html');
    const links = htmlDoc.querySelectorAll('a');
    
    if (links.length > 0) {
      const newLink: ResourceLink = {
        id: `custom-${Date.now()}`,
        title: links[0].textContent || links[0].href,
        url: links[0].href
      };

      if (resourceCategories.length > 0) {
        setResourceCategories(categories => [
          {
            ...categories[0],
            links: [...categories[0].links, newLink]
          },
          ...categories.slice(1)
        ]);
      }
    } else if (customLink.startsWith('http')) {
      const newLink: ResourceLink = {
        id: `custom-${Date.now()}`,
        title: customLink,
        url: customLink
      };

      if (resourceCategories.length > 0) {
        setResourceCategories(categories => [
          {
            ...categories[0],
            links: [...categories[0].links, newLink]
          },
          ...categories.slice(1)
        ]);
      }
    }

    setCustomLink("");
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Help Center</h1>
        </div>

        <div className="bg-card border rounded-lg p-4 flex items-center space-x-2">
          <Input
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="default">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-md">
            <h2 className="font-medium mb-2">Search Results</h2>
            {searchResults.length === 0 ? (
              <ValidationError 
                message="No results found. Try a different search term." 
                type="info"
              />
            ) : (
              <p className="text-sm text-muted-foreground mb-4">{searchResults.length} results found</p>
            )}
          </div>
        )}

        <Tabs defaultValue="troubleshooting" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            <TabsTrigger value="dashboard-guide">Dashboard Guide</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="troubleshooting" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>Common issues and how to resolve them. If your problem isn't listed here, please contact our support team.</p>
            </div>

            <div className="space-y-3">
              {troubleshootingItems.map((item) => (
                <Collapsible 
                  key={item.id} 
                  open={expanded[item.id] || false}
                  onOpenChange={() => toggleExpanded(item.id)}
                  className={`border rounded-md ${
                    searchResults.includes(item.id) ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex w-full justify-between p-4 rounded-md hover:bg-transparent hover:text-current"
                    >
                      <div className="font-medium text-left flex items-center">
                        <Bug className="h-4 w-4 mr-2 text-red-500" />
                        {item.title}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expanded[item.id] ? "transform rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 pt-0 text-sm">
                    <div className="space-y-2">
                      <div className="p-2 bg-muted/40 rounded-md">
                        <h4 className="font-medium text-muted-foreground">Symptom:</h4>
                        <p>{item.symptom}</p>
                      </div>
                      <div className="p-2 bg-muted/20 rounded-md">
                        <h4 className="font-medium text-muted-foreground">Solution:</h4>
                        <p>{item.solution}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Common Troubleshooting Steps
                </CardTitle>
                <CardDescription>
                  Try these general steps when encountering issues with the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                    <div>
                      <h3 className="font-medium">Refresh the page</h3>
                      <p className="text-sm text-muted-foreground">Sometimes a simple refresh can resolve temporary glitches or loading issues.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h3 className="font-medium">Clear browser cache</h3>
                      <p className="text-sm text-muted-foreground">Cached data can sometimes cause conflicts. Try clearing your browser cache and cookies.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
                    <div>
                      <h3 className="font-medium">Try a different browser</h3>
                      <p className="text-sm text-muted-foreground">If the issue persists, try using a different browser to see if it's browser-specific.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
                    <div>
                      <h3 className="font-medium">Check your connection</h3>
                      <p className="text-sm text-muted-foreground">Ensure you have a stable internet connection, especially when updating client data.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center shrink-0">5</div>
                    <div>
                      <h3 className="font-medium">Contact support</h3>
                      <p className="text-sm text-muted-foreground">If you've tried all the above steps and still experience issues, please contact our support team.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dashboard-guide" className="space-y-6">
            <div className="text-muted-foreground mb-4">
              <p>Learn how the dashboard is designed and how to make the most of its features.</p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dashboard Architecture</CardTitle>
                  <CardDescription>Understanding how the dashboard is organized</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <p>
                      Our dashboard is built with a modular approach, allowing you to access different views and functionality through a tab-based navigation system. The main sections include:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="border rounded-md p-3">
                        <div className="flex items-center mb-2">
                          <LayoutDashboard className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Overview</span>
                        </div>
                        <p className="text-sm text-muted-foreground">The main dashboard view with key metrics, health scores, and team analytics.</p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <div className="flex items-center mb-2">
                          <ClipboardList className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">Tasks</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Task management system for tracking client-related activities.</p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <div className="flex items-center mb-2">
                          <Zap className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="font-medium">Automations</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Set up automated workflows and third-party integrations.</p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <div className="flex items-center mb-2">
                          <FileBarChart className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">Advanced Analytics</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Detailed charts and reports for data-driven decisions.</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Performance Optimization</h4>
                      <p>
                        The dashboard is designed to handle large datasets while maintaining performance. When working with many clients or students, consider enabling Performance Mode from the dashboard header to optimize loading speeds.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Data Persistence</h4>
                      <p>
                        Enable the "Auto-save" option in the dashboard header to ensure changes are automatically saved between sessions. This is particularly important when working with the Kanban board or updating client information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Feature Guides</h3>
                
                <div className="grid gap-4">
                  {dashboardGuides.map((guide) => (
                    <Collapsible key={guide.id} className="border rounded-md">
                      <CollapsibleTrigger 
                        className="flex items-center justify-between w-full p-4 font-medium"
                        onClick={() => toggleExpanded(guide.id)}
                      >
                        <div className="flex items-center">
                          <guide.icon className="h-5 w-5 mr-2 text-primary" />
                          <span>{guide.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expanded[guide.id] ? "transform rotate-180" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 pt-0 border-t mt-4">
                        <p className="text-sm">{guide.content}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Workflows</CardTitle>
                  <CardDescription>Step-by-step guides for frequent scenarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {commonScenarios.map((scenario) => (
                      <AccordionItem key={scenario.id} value={scenario.id}>
                        <AccordionTrigger className="font-medium">
                          {scenario.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ol className="space-y-2 mt-2">
                            {scenario.steps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span className="text-sm">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-500" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Regular Data Updates
                      </h3>
                      <p className="text-sm mt-1">Keep client information and metrics up to date for accurate health scores and analytics.</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Use the Kanban Board
                      </h3>
                      <p className="text-sm mt-1">For student tracking, the Kanban board provides the most visual and intuitive interface for status management.</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Enable Auto-Save
                      </h3>
                      <p className="text-sm mt-1">Always enable auto-save when working with important client data to prevent loss of information.</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Document Churn Reasons
                      </h3>
                      <p className="text-sm mt-1">When recording churned clients in the Backend Sales Tracker, always document the reasons to help improve retention strategies.</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Use Bulk Actions
                      </h3>
                      <p className="text-sm mt-1">When updating multiple clients with the same information, use the bulk actions feature to save time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-6">
            <div className="text-muted-foreground mb-4">
              <p>Important resources and links organized by category.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {resourceCategories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{category.title}</h3>
                  </div>
                  
                  <ul className="space-y-2">
                    {category.links.map((link) => (
                      <li key={link.id} className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-5 mt-8">
              <h3 className="font-medium mb-4">Add New Resource</h3>
              
              <div className="grid gap-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="link-title" className="text-sm font-medium mb-1 block">
                      Link Title
                    </label>
                    <Input
                      id="link-title"
                      placeholder="Enter link title"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="link-url" className="text-sm font-medium mb-1 block">
                      Link URL
                    </label>
                    <Input
                      id="link-url"
                      placeholder="https://example.com"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="text-sm font-medium mb-1 block">
                    Category
                  </label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {resourceCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Button onClick={handleAddLink} disabled={!newLinkTitle || !newLinkUrl || !selectedCategory}>
                Add Resource
              </Button>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Quick Add</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Paste a link or HTML and add it directly to the first category.
                </p>
                
                <div className="flex flex-col space-y-3">
                  <Textarea
                    placeholder="Paste a link or HTML with links here..."
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddCustomLink}
                    className="self-start"
                    disabled={!customLink}
                  >
                    Add Custom Link
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions about the dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>How is the client health score calculated?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">
                        Client health scores are calculated using a proprietary algorithm that considers several factors including:
                      </p>
                      <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                        <li>Recent engagement metrics</li>
                        <li>Meeting attendance</li>
                        <li>Payment history</li>
                        <li>Client satisfaction indicators</li>
                        <li>Progress towards goals</li>
                      </ul>
                      <p className="text-sm mt-2">
                        Each factor is weighted differently based on its importance, and the resulting score ranges from 0 to 100, with higher scores indicating healthier client relationships.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>Can I export data from the dashboard?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">
                        Yes, most data in the dashboard can be exported. Look for the export button (usually showing a download icon) in the respective section. You can typically export data in CSV, Excel, or PDF formats depending on the type of data. Analytics charts can also be exported as image files.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>How do I set up automated alerts for at-risk clients?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">
                        Navigate to the Automations tab and select "Create New Automation." Choose "Client Health Score" as the trigger type and set the condition to trigger when a client's health score drops below your desired threshold (typically 60 for at-risk clients). Then, select the action type (email notification, task creation, etc.) and save the automation.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>What's the difference between the Client List and Kanban Board?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">
                        The Client List provides a comprehensive tabular view of all clients with filtering and sorting capabilities. It's ideal for quickly finding specific clients and performing bulk actions. The Kanban Board offers a visual representation of clients organized by their status, allowing for intuitive drag-and-drop management. The Kanban view is particularly useful for tracking student progress through different stages of their journey.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>How does the Backend Sales Tracker work?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">
                        The Backend Sales Tracker is designed to monitor client renewals and churn. When a client is up for renewal, you can record whether they renewed their contract or churned. For churned clients, you can document specific reasons for the churn, which then appear in the Churn Reasons analysis. The system automatically calculates renewal rates and provides analytics on churn patterns to help improve retention strategies.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-6">
                    <AccordionTrigger>Can multiple team members use the dashboard simultaneously?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">
                        Yes, the dashboard supports simultaneous multi-user access. Each team member can log in with their own credentials and work on the system concurrently. Changes made by one user are visible to others after a page refresh or automatically if Real-time Updates are enabled in Settings. User permissions can be configured to control access to specific features or client data.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/70 mb-2" />
                <p className="text-muted-foreground">Contact support content coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
