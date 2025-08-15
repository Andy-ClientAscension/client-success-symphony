import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, AlertTriangle, CheckCircle, Key, Loader2 } from 'lucide-react';
import { hasOpenRouterKey, getOpenRouterKey, saveOpenRouterKey, generateAIResponse } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';

interface AIBotSetupProps {
  onSetupComplete?: () => void;
}

export function AIBotSetup({ onSetupComplete }: AIBotSetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const configured = hasOpenRouterKey();
    setIsConfigured(configured);
    if (configured) {
      setApiKey(getOpenRouterKey());
    }
  }, []);

  const testApiKey = async (keyToTest: string) => {
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const testResponse = await generateAIResponse([
        { role: 'user', content: 'Hello! Please respond with just "Test successful" to confirm the API key works.' }
      ], keyToTest);

      if (testResponse.includes('Test successful') || testResponse.includes('test successful')) {
        setTestResult('success');
        return true;
      } else {
        setTestResult('error');
        return false;
      }
    } catch (error) {
      console.error('API key test failed:', error);
      setTestResult('error');
      return false;
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Invalid API Key',
        description: 'Please enter a valid OpenRouter API key.',
        variant: 'destructive'
      });
      return;
    }

    // Test the key before saving
    const isValid = await testApiKey(apiKey);
    
    if (isValid) {
      saveOpenRouterKey(apiKey);
      setIsConfigured(true);
      toast({
        title: 'API Key Saved',
        description: 'OpenRouter API key has been saved and verified.',
      });
      onSetupComplete?.();
    } else {
      toast({
        title: 'Invalid API Key',
        description: 'The provided API key could not be verified. Please check and try again.',
        variant: 'destructive'
      });
    }
  };

  const handleTestExistingKey = async () => {
    const existingKey = getOpenRouterKey();
    if (existingKey) {
      await testApiKey(existingKey);
    }
  };

  if (isConfigured) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            AI Bot Configured
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your AI bot is ready to use! You can now get insights and assistance.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTestExistingKey} 
              variant="outline"
              disabled={isTestingKey}
            >
              {isTestingKey ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            
            <Button 
              onClick={() => {
                setIsConfigured(false);
                setApiKey('');
                setTestResult(null);
              }}
              variant="outline"
            >
              Reconfigure
            </Button>
          </div>

          {testResult === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                API connection test successful!
              </AlertDescription>
            </Alert>
          )}

          {testResult === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                API connection test failed. Your key may have expired or reached its limit.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Set Up AI Bot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            To use the AI bot, you need to configure an OpenRouter API key. 
            This enables intelligent insights and assistance features.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="api-key">OpenRouter API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your OpenRouter API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleSaveKey} 
            className="w-full"
            disabled={!apiKey.trim() || isTestingKey}
          >
            {isTestingKey ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing & Saving...
              </>
            ) : (
              'Save & Test API Key'
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>How to get an OpenRouter API key:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a></li>
            <li>Sign up for a free account</li>
            <li>Add credits to your account ($5 minimum)</li>
            <li>Generate an API key in your dashboard</li>
            <li>Copy the key and paste it above</li>
          </ol>
        </div>

        {testResult === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              API key test failed. Please verify your key is correct and has sufficient credits.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}