
import { Layout } from "@/components/Layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ValidationError } from "@/components/ValidationError";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
    
    // Auto-expand search results
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
