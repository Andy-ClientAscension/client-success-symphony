
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Lock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function PrivacyPolicy() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Privacy Policy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          <p className="mb-2">Last updated: April 15, 2025</p>
          <p>This privacy policy explains how we handle data within the dashboard application.</p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="data-collection">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Data Collection and Storage
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                <p>This dashboard currently stores all data locally on your device using browser local storage.</p>
                <p>No data is transmitted to our servers or third parties unless you explicitly opt in to cloud storage services.</p>
                <p>Your data remains private and accessible only on the device where it was created.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="data-usage">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Data Security
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                <p>The security of your data is limited by the security of your browser's local storage.</p>
                <p>We recommend:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Using the dashboard on a secure, private device</li>
                  <li>Creating regular data backups</li>
                  <li>Not accessing sensitive data on public or shared computers</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="user-rights">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Your Data Rights
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                <p>You maintain full control over your data:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Export your data at any time</li>
                  <li>Delete all stored data using the clear data function</li>
                  <li>Modify your data directly through the dashboard interface</li>
                </ul>
                <p className="mt-2">If you have any questions about your data, please contact our support team.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
