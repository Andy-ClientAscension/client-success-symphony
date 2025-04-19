
import React, { useEffect } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function DiagnosticIndex() {
  useEffect(() => {
    console.log("DiagnosticIndex mounted");
    return () => console.log("DiagnosticIndex unmounted");
  }, []);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Application Diagnostic Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Diagnostic Mode</AlertTitle>
            <AlertDescription>
              This is a minimal diagnostic page to test rendering. If you can see this, your app is rendering correctly.
            </AlertDescription>
          </Alert>
          
          <div className="p-4 border rounded">
            <h2 className="font-semibold">System Info:</h2>
            <ul className="list-disc pl-5 mt-2">
              <li>React is rendering</li>
              <li>Component tree is working</li>
              <li>Basic UI elements are displaying</li>
            </ul>
          </div>
          
          <div className="text-sm text-gray-500">
            If you're seeing this page instead of your normal dashboard, there may be an issue with your main Index component.
            Check the console for additional error messages.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
