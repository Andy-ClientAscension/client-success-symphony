import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, AlertTriangle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityFix {
  id: string;
  title: string;
  category: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  description: string;
  steps: string[];
  codeExample?: string;
  references?: { title: string; url: string }[];
}

const securityFixes: SecurityFix[] = [
  {
    id: 'fix-001',
    title: 'Remove Hardcoded Secrets',
    category: 'Secrets Management',
    priority: 'immediate',
    effort: 'medium',
    description: 'Replace hardcoded credentials with environment variables and proper secret management.',
    steps: [
      'Remove hardcoded credentials from src/utils/envValidator.ts',
      'Create proper environment configuration',
      'Use Supabase Edge Functions for sensitive operations',
      'Implement secret rotation policies'
    ],
    codeExample: `// BEFORE (Vulnerable)
const getDevelopmentFallbacks = () => ({
  VITE_SUPABASE_URL: 'https://hardcoded-url...',
  VITE_SUPABASE_KEY: 'hardcoded-key...'
});

// AFTER (Secure)
const getSupabaseConfig = () => ({
  url: import.meta.env.VITE_SUPABASE_URL || '',
  key: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
});`,
    references: [
      { title: 'Supabase Environment Variables', url: 'https://supabase.com/docs/guides/cli/config' }
    ]
  },
  {
    id: 'fix-002',
    title: 'Implement HTML Sanitization',
    category: 'XSS Prevention',
    priority: 'immediate',
    effort: 'low',
    description: 'Add DOMPurify to sanitize HTML content before rendering.',
    steps: [
      'Install DOMPurify library',
      'Create sanitization utility function',
      'Replace dangerouslySetInnerHTML with sanitized content',
      'Add Content Security Policy headers'
    ],
    codeExample: `// Install: npm install dompurify @types/dompurify

import DOMPurify from 'dompurify';

// BEFORE (Vulnerable)
<p dangerouslySetInnerHTML={{ __html: note.text }} />

// AFTER (Secure)
const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
};

<p dangerouslySetInnerHTML={{ __html: sanitizeHTML(note.text) }} />`,
    references: [
      { title: 'DOMPurify Documentation', url: 'https://github.com/cure53/DOMPurify' }
    ]
  },
  {
    id: 'fix-003',
    title: 'Add Input Validation with Zod',
    category: 'Input Validation',
    priority: 'high',
    effort: 'medium',
    description: 'Implement comprehensive input validation using Zod schemas.',
    steps: [
      'Create Zod schemas for all forms',
      'Add server-side validation',
      'Implement proper error handling',
      'Add input sanitization'
    ],
    codeExample: `import { z } from 'zod';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

// Use in form validation
const validateLogin = (data: unknown) => {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid input data');
  }
};`,
    references: [
      { title: 'Zod Documentation', url: 'https://zod.dev/' }
    ]
  },
  {
    id: 'fix-004',
    title: 'Secure Local Storage',
    category: 'Data Protection',
    priority: 'high',
    effort: 'medium',
    description: 'Encrypt sensitive data before storing in localStorage.',
    steps: [
      'Identify sensitive data in localStorage',
      'Implement encryption utility',
      'Replace direct localStorage calls',
      'Add data expiration policies'
    ],
    codeExample: `import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-encryption-key';

export const secureStorage = {
  setItem: (key: string, value: any) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value), 
      ENCRYPTION_KEY
    ).toString();
    localStorage.setItem(key, encrypted);
  },
  
  getItem: (key: string) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
};`,
    references: [
      { title: 'CryptoJS Documentation', url: 'https://cryptojs.gitbook.io/' }
    ]
  }
];

export function SecurityFixGuidance() {
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate':
        return 'destructive';
      case 'high':
        return 'outline';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getEffortText = (effort: string) => {
    switch (effort) {
      case 'low':
        return { text: 'Low Effort', icon: '🟢' };
      case 'medium':
        return { text: 'Medium Effort', icon: '🟡' };
      case 'high':
        return { text: 'High Effort', icon: '🔴' };
      default:
        return { text: 'Unknown', icon: '⚪' };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
  };

  const immediateIssues = securityFixes.filter(fix => fix.priority === 'immediate');
  const highPriorityIssues = securityFixes.filter(fix => fix.priority === 'high');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Security Fix Guidance</h2>
        <p className="text-muted-foreground">
          Step-by-step remediation guide for identified security vulnerabilities
        </p>
      </div>

      {/* Immediate Action Required */}
      {immediateIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Immediate Action Required:</strong> {immediateIssues.length} critical security 
            issues need to be fixed immediately to prevent potential data breaches.
          </AlertDescription>
        </Alert>
      )}

      {/* Fix Cards */}
      <div className="space-y-6">
        {securityFixes.map((fix) => {
          const effortInfo = getEffortText(fix.effort);
          
          return (
            <Card key={fix.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{fix.title}</CardTitle>
                      <Badge variant={getPriorityColor(fix.priority)}>
                        {fix.priority === 'immediate' ? '🚨 IMMEDIATE' : fix.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      {fix.category} • {effortInfo.icon} {effortInfo.text}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {fix.priority === 'immediate' && (
                      <Clock className="h-5 w-5 text-destructive animate-pulse" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">{fix.description}</p>
                
                {/* Implementation Steps */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Implementation Steps
                  </h4>
                  <ol className="space-y-2">
                    {fix.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Code Example */}
                {fix.codeExample && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Code Example</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(fix.codeExample!)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{fix.codeExample}</code>
                    </pre>
                  </div>
                )}

                {/* References */}
                {fix.references && fix.references.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">References</h4>
                    <div className="space-y-2">
                      {fix.references.map((ref, index) => (
                        <a
                          key={index}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {ref.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Security Recommendations</CardTitle>
          <CardDescription>
            Best practices to further strengthen your application security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Prevention</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Regular security audits</li>
                <li>• Automated vulnerability scanning</li>
                <li>• Code review process</li>
                <li>• Security training for developers</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Monitoring</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real-time security monitoring</li>
                <li>• Audit logging and alerting</li>
                <li>• Incident response procedures</li>
                <li>• Regular penetration testing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}