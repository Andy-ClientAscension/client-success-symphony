
import React, { useState } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Bell, HelpCircle, Settings, Youtube, FileQuestion, BookOpen, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PreLaunchChecklist } from "@/components/Dashboard/PreLaunchChecklist";
import { PrivacyPolicy } from "@/components/Dashboard/PrivacyPolicy";
import { PublishingChecklist } from "@/components/Dashboard/PublishingChecklist";

export default function Help() {
  const [activeTab, setActiveTab] = useState('launch');

  const helpSections = [
    {
      id: 'launch',
      title: 'Launch Prep',
      icon: ShieldCheck,
      description: 'Prepare your dashboard for launch',
      content: (
        <div className="space-y-6">
          <PreLaunchChecklist />
          <PublishingChecklist />
        </div>
      )
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: Lock,
      description: 'Privacy policy and legal documents',
      content: (
        <div className="space-y-4">
          <PrivacyPolicy />
        </div>
      )
    },
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
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: FileQuestion,
      description: 'Frequently asked questions',
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I add a new student?</AccordionTrigger>
                  <AccordionContent>
                    You can add a new student by clicking the "Add Student" button in the Student Tracking section. Fill in the required information and click "Save" to create a new student record.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I track student progress?</AccordionTrigger>
                  <AccordionContent>
                    Student progress is tracked automatically and displayed as a progress bar on each student card. You can manually update a student's progress by clicking on their card and editing their details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What does the "At Risk" column mean?</AccordionTrigger>
                  <AccordionContent>
                    The "At Risk" column contains students who may need additional attention or support. Students are flagged as "At Risk" based on their progress, engagement metrics, and payment status.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I export student data?</AccordionTrigger>
                  <AccordionContent>
                    To export student data, navigate to the Reports section and click on "Export Data". You can choose to export all data or filter by specific criteria before downloading.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I customize the board layout?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can customize the board layout in Settings {'>'}{'>'} Dashboard Preferences. You can choose which columns to display, change the order of columns, and adjust other visual settings.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'guides',
      title: 'Guides',
      icon: BookOpen,
      description: 'Detailed user guides',
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="text-lg font-medium">Step 1: Set Up Your Account</h3>
                  <p className="text-muted-foreground">Complete your profile and customize your preferences.</p>
                </div>
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="text-lg font-medium">Step 2: Import Your Data</h3>
                  <p className="text-muted-foreground">Use the import wizard to bring in existing student records.</p>
                </div>
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="text-lg font-medium">Step 3: Configure Your Dashboard</h3>
                  <p className="text-muted-foreground">Customize your view to focus on the metrics that matter most to you.</p>
                </div>
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="text-lg font-medium">Step 4: Set Up Notifications</h3>
                  <p className="text-muted-foreground">Configure alerts for important events and milestones.</p>
                </div>
              </div>
              <Button className="mt-6">View Full Guide</Button>
            </CardContent>
          </Card>
        </div>
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
