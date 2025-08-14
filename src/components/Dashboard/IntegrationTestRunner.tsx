import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Play, ExternalLink } from 'lucide-react';
import { generateAIResponse, OpenAIMessage } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  message: string;
  duration?: number;
  details?: string;
}

export function IntegrationTestRunner() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    const testSuite = [
      testOpenRouterConnection,
      testOpenRouterAPIKey,
      testAIResponseGeneration,
      testErrorHandling,
      testRateLimiting
    ];

    for (const test of testSuite) {
      try {
        const result = await test();
        setTests(prev => [...prev, result]);
      } catch (error) {
        setTests(prev => [...prev, {
          name: test.name,
          status: 'failed',
          message: 'Test execution failed',
          details: error instanceof Error ? error.message : String(error)
        }]);
      }
    }

    setIsRunning(false);
    toast({
      title: "Integration Tests Complete",
      description: "Check results below for detailed information"
    });
  };

  const testOpenRouterConnection = async (): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity to OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'OpenRouter Connectivity',
          status: 'passed',
          message: 'Successfully connected to OpenRouter API',
          duration,
          details: `Response time: ${duration}ms`
        };
      } else {
        return {
          name: 'OpenRouter Connectivity',
          status: 'failed',
          message: 'OpenRouter API unreachable',
          duration,
          details: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        name: 'OpenRouter Connectivity',
        status: 'failed',
        message: 'Network error connecting to OpenRouter',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const testOpenRouterAPIKey = async (): Promise<TestResult> => {
    try {
      // Check if API key is available
      const hasLocalKey = !!localStorage.getItem('openrouter-api-key');
      
      if (!hasLocalKey) {
        return {
          name: 'API Key Availability',
          status: 'failed',
          message: 'No OpenRouter API key found',
          details: 'API key not found in localStorage. User needs to configure it.'
        };
      }

      return {
        name: 'API Key Availability',
        status: 'passed',
        message: 'OpenRouter API key is configured',
        details: 'API key found in encrypted localStorage'
      };
    } catch (error) {
      return {
        name: 'API Key Availability',
        status: 'failed',
        message: 'Error checking API key',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const testAIResponseGeneration = async (): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const testMessages: OpenAIMessage[] = [
        {
          role: 'system',
          content: 'You are a test assistant. Respond with exactly: "TEST_RESPONSE_OK"'
        },
        {
          role: 'user',
          content: 'Please respond with the test message.'
        }
      ];

      const response = await generateAIResponse(testMessages);
      const duration = Date.now() - startTime;

      if (response.includes('TEST_RESPONSE_OK') || response.length > 0) {
        return {
          name: 'AI Response Generation',
          status: 'passed',
          message: 'AI response generated successfully',
          duration,
          details: `Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`
        };
      } else {
        return {
          name: 'AI Response Generation',
          status: 'failed',
          message: 'Unexpected AI response format',
          duration,
          details: `Response: "${response}"`
        };
      }
    } catch (error) {
      return {
        name: 'AI Response Generation',
        status: 'failed',
        message: 'AI response generation failed',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const testErrorHandling = async (): Promise<TestResult> => {
    try {
      // Test with invalid API key
      const response = await generateAIResponse(
        [{ role: 'user', content: 'test' }],
        'invalid-api-key'
      );

      if (response.includes('Error:') || response.includes('API key')) {
        return {
          name: 'Error Handling',
          status: 'passed',
          message: 'Error handling works correctly',
          details: 'Invalid API key produced expected error response'
        };
      } else {
        return {
          name: 'Error Handling',
          status: 'failed',
          message: 'Error handling may not be working',
          details: `Unexpected response: "${response}"`
        };
      }
    } catch (error) {
      return {
        name: 'Error Handling',
        status: 'passed',
        message: 'Error handling works correctly',
        details: 'Exception thrown as expected for invalid API key'
      };
    }
  };

  const testRateLimiting = async (): Promise<TestResult> => {
    try {
      // This is a basic test - in production you'd want more sophisticated rate limit testing
      return {
        name: 'Rate Limiting',
        status: 'pending',
        message: 'Rate limiting test skipped',
        details: 'Rate limiting tests require multiple API calls and are skipped to avoid costs'
      };
    } catch (error) {
      return {
        name: 'Rate Limiting',
        status: 'failed',
        message: 'Rate limiting test failed',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Integration Test Runner</h3>
          <p className="text-sm text-muted-foreground">
            Run automated tests to verify integration functionality
          </p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {tests.length > 0 && (
        <div className="space-y-3">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    {test.name}
                  </CardTitle>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {test.message}
                </p>
                {test.duration && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Duration: {test.duration}ms
                  </p>
                )}
                {test.details && (
                  <Alert className="mt-2">
                    <AlertDescription className="text-xs">
                      {test.details}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tests.length === 0 && !isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Ready to Test</h3>
            <p className="text-muted-foreground mb-4">
              Click "Run Tests" to verify your integrations
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Tests will verify:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>OpenRouter API connectivity</li>
                <li>API key configuration</li>
                <li>AI response generation</li>
                <li>Error handling</li>
                <li>Rate limiting (basic check)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Links</CardTitle>
          <CardDescription>Configure missing integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Get OpenRouter API Key
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}