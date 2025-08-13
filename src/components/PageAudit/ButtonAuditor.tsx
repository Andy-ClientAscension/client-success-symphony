import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ButtonAuditResult {
  total: number;
  functional: number;
  nonFunctional: number;
  issues: Array<{
    id: string;
    text: string;
    reason: string;
    element: HTMLButtonElement;
  }>;
}

export function ButtonAuditor({ onAuditComplete }: { onAuditComplete?: (result: ButtonAuditResult) => void }) {
  const [auditResult, setAuditResult] = useState<ButtonAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const auditButtons = async () => {
    setIsAuditing(true);
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
    const issues: ButtonAuditResult['issues'] = [];
    let functional = 0;

    buttons.forEach((button, index) => {
      const hasClickHandler = !!(
        button.onclick ||
        button.getAttribute('onClick') ||
        button.closest('form') ||
        button.type === 'submit' ||
        button.getAttribute('data-state') || // For shadcn components
        button.getAttribute('data-radix-collection-item') || // For radix components
        button.querySelector('[data-radix-collection-item]') ||
        button.className.includes('cursor-pointer')
      );

      if (hasClickHandler) {
        functional++;
      } else {
        const buttonText = button.textContent?.trim() || button.getAttribute('aria-label') || `Button ${index + 1}`;
        issues.push({
          id: `btn-${index}`,
          text: buttonText,
          reason: 'No click handler detected',
          element: button
        });
      }
    });

    const result: ButtonAuditResult = {
      total: buttons.length,
      functional,
      nonFunctional: buttons.length - functional,
      issues
    };

    setAuditResult(result);
    onAuditComplete?.(result);
    setIsAuditing(false);
  };

  const highlightButton = (element: HTMLButtonElement) => {
    element.style.outline = '2px solid red';
    element.style.outlineOffset = '2px';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 3000);
  };

  useEffect(() => {
    auditButtons();
  }, []);

  if (isAuditing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Auditing buttons...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!auditResult) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Button Functionality Audit
          <Button onClick={auditButtons} variant="outline" size="sm">
            Re-audit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{auditResult.total}</div>
            <div className="text-sm text-muted-foreground">Total Buttons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{auditResult.functional}</div>
            <div className="text-sm text-muted-foreground">Functional</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{auditResult.nonFunctional}</div>
            <div className="text-sm text-muted-foreground">Non-functional</div>
          </div>
        </div>

        {auditResult.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Issues Found:</h4>
            {auditResult.issues.slice(0, 10).map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{issue.text}</span>
                  <div className="text-xs text-muted-foreground">{issue.reason}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="text-xs">Issue</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => highlightButton(issue.element)}
                    className="h-6 px-2"
                  >
                    Locate
                  </Button>
                </div>
              </div>
            ))}
            {auditResult.issues.length > 10 && (
              <div className="text-xs text-muted-foreground text-center">
                +{auditResult.issues.length - 10} more issues
              </div>
            )}
          </div>
        )}

        {auditResult.issues.length === 0 && (
          <div className="text-center py-4 text-green-600">
            ✅ All buttons appear to be functional!
          </div>
        )}
      </CardContent>
    </Card>
  );
}