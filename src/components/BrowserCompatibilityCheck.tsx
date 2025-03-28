
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { detectBrowser, hasGoodBrowserSupport } from "@/utils/browserCompatibility";
import { Button } from "@/components/ui/button";

export function BrowserCompatibilityCheck() {
  const [isCompatible, setIsCompatible] = useState(true);
  const [browser, setBrowser] = useState<{ name: string; version: string } | null>(null);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const browserInfo = detectBrowser();
    setBrowser(browserInfo);
    setIsCompatible(hasGoodBrowserSupport());
  }, []);

  if (isCompatible || !showWarning) return null;

  return (
    <Alert variant="destructive" className="fixed bottom-4 left-4 max-w-md z-50 bg-amber-50 border-amber-200">
      <AlertTitle className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
        </svg>
        Browser Compatibility Warning
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          You're using {browser?.name} {browser?.version}, which may not fully support all features of this application.
        </p>
        <p className="mb-3 text-sm">
          For the best experience, we recommend using the latest version of Chrome, Firefox, Edge, or Safari.
        </p>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowWarning(false)}
            className="text-xs"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
