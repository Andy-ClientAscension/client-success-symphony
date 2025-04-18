
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Key } from "lucide-react";
import { saveOpenAIKey, hasOpenAIKey } from '@/lib/openai';

interface OpenAIKeyInputProps {
  onSubmit: () => void;
}

export function OpenAIKeyInput({ onSubmit }: OpenAIKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    
    // Simple validation - OpenAI keys typically start with "sk-"
    if (!apiKey.trim().startsWith('sk-')) {
      setError('API key seems invalid. OpenAI keys typically start with "sk-"');
      return;
    }
    
    try {
      saveOpenAIKey(apiKey.trim());
      setApiKey('');
      setError('');
      onSubmit();
    } catch (err) {
      console.error('Error saving API key:', err);
      setError('Failed to save API key. Please try again.');
    }
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
          Enter your OpenAI API key to enable AI insights. Your key is stored locally and never sent to our servers.
        </AlertDescription>
      </Alert>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <div className="flex space-x-2">
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="sk-..."
              className="flex-1"
            />
            <Button type="submit">
              <Key className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Don't have an API key? <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one from OpenAI</a></p>
          <p className="mt-1">Your data is processed securely using your own API key.</p>
        </div>
      </form>
    </div>
  );
}
