import { Layout } from "@/components/Layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ExternalLink, FileText, HelpCircle, Link as LinkIcon, Phone, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ValidationError } from "@/components/ValidationError";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = troubleshootingItems
      .filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.symptom.toLowerCase().includes(query) || 
        item.solution.toLowerCase().includes(query)
      )
      .map(item => item.id);
    
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
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">User Guides</TabsTrigger>
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
                      <div className="font-medium text-left">{item.title}</div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expanded[item.id] ? "transform rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 pt-0 text-sm">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-muted-foreground">Symptom:</h4>
                        <p>{item.symptom}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground">Solution:</h4>
                        <p>{item.solution}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
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
            <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/70 mb-2" />
                <p className="text-muted-foreground">FAQ content coming soon</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="guides">
            <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/70 mb-2" />
                <p className="text-muted-foreground">User guides content coming soon</p>
              </div>
            </div>
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
