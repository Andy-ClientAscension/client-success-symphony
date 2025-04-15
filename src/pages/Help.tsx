
import React, { useState } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Bell, HelpCircle, Settings, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Help() {
  const [activeTab, setActiveTab] = useState('notifications');

  const helpSections = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Understanding dashboard notifications and alerts',
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <strong>Renewal Alerts:</strong> Notifies you about upcoming contract renewals
                </li>
                <li>
                  <strong>Payment Notifications:</strong> Alerts for overdue or pending payments
                </li>
                <li>
                  <strong>System Status:</strong> Online/offline connection alerts
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configuring Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Customize your notification preferences in Settings {'>'}{'>'} Notifications</p>
              <Button variant="outline" className="mt-4">
                Go to Notification Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: HelpCircle,
      description: 'Resolving common dashboard issues',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Common Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal pl-6">
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Clear browser cache</li>
              <li>Contact support if issues persist</li>
            </ol>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Help Center</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {helpSections.map(section => (
              <TabsTrigger key={section.id} value={section.id}>
                <section.icon className="mr-2 h-4 w-4" />
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {helpSections.map(section => (
            <TabsContent key={section.id} value={section.id}>
              {section.content}
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-8 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="outline" className="mr-4">
                  <Youtube className="mr-2 h-4 w-4" /> Video Tutorials
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Watch guided tutorials for dashboard features
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="secondary">
            <Settings className="mr-2 h-4 w-4" /> Customize Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
}
