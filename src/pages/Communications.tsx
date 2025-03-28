import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, FileText, Link as LinkIcon, Phone, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommunicationLog } from "@/components/Dashboard/CommunicationLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CLIENTS } from "@/lib/data";
import { Link } from "react-router-dom";

const allCommunications = MOCK_CLIENTS.flatMap(client => 
  client.communicationLog.map(comm => ({
    ...comm,
    clientName: client.name
  }))
).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

export default function Communications() {
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
      <div className="container py-6 max-w-6xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Communications</h1>
            <p className="text-muted-foreground">Manage all your communication links and recent communications.</p>
          </div>
          <Button asChild variant="destructive" className="gap-2 text-white bg-red-600 hover:bg-red-700 text-base px-6 py-2">
            <Link to="/">
              <Home className="h-5 w-5" />
              Return to Home
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="recent">Recent Communications</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent">
                <CommunicationLog communications={allCommunications} />
              </TabsContent>
              
              <TabsContent value="resources" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {resourceCategories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-md flex items-center gap-2">
                          <category.icon className="h-5 w-5 text-primary" />
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <Button 
                  onClick={handleAddLink} 
                  disabled={!newLinkTitle || !newLinkUrl || !selectedCategory}
                  className="w-full"
                >
                  Add Resource
                </Button>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Quick Add</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Paste a link or HTML with links here.
                  </p>
                  
                  <Textarea
                    placeholder="Paste a link or HTML with links here..."
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    className="min-h-[100px] mb-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddCustomLink}
                    className="w-full"
                    disabled={!customLink}
                  >
                    Add Custom Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
