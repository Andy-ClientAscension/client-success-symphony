
import React, { useEffect } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function DiagnosticIndex() {
  useEffect(() => {
    console.log("DiagnosticIndex mounted");
    
    // Log relevant browser information
    console.log("Browser Info:", {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      viewportSize: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`
    });
    
    return () => console.log("DiagnosticIndex unmounted");
  }, []);

  return (
    <Layout>
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Card className="max-w-2xl mx-auto border-4 border-orange-500">
          <CardHeader className="bg-orange-100 dark:bg-orange-900/20">
            <CardTitle className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              DIAGNOSTIC MODE ACTIVE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Alert variant="default" className="border-2 border-blue-300 bg-blue-50 dark:bg-blue-900/20">
              <InfoIcon className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-lg font-semibold">Diagnostic Page Rendered Successfully</AlertTitle>
              <AlertDescription className="text-base">
                If you can see this message, React is rendering correctly. The issue is likely in your main application components.
              </AlertDescription>
            </Alert>
            
            <div className="p-4 border-2 border-green-300 rounded bg-green-50 dark:bg-green-900/20">
              <h2 className="font-semibold text-lg text-green-700 dark:text-green-400">System Check:</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>✅ React is rendering</li>
                <li>✅ Component mounting works</li>
                <li>✅ Layout component works</li>
                <li>✅ UI components displaying</li>
              </ul>
            </div>
            
            <div className="p-4 border-2 border-purple-300 rounded bg-purple-50 dark:bg-purple-900/20">
              <h2 className="font-semibold text-lg text-purple-700 dark:text-purple-400">Next Steps:</h2>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li>Check console for errors</li>
                <li>Switch back to main Index by setting <code>?diagnostic=false</code> in the URL</li>
                <li>Debug component by component</li>
              </ol>
            </div>
            
            <div className="text-sm text-gray-500 p-4 border rounded">
              URL Parameters: <code>?diagnostic=true</code> (current) | <code>?diagnostic=false</code> (normal mode)
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
