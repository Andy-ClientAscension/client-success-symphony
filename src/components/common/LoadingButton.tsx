/**
 * Reusable Loading Button Component
 * Consolidates loading state patterns with built-in error handling
 */

import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAsyncOperation } from '@/hooks/use-async-operation';

interface LoadingButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: () => Promise<void> | void;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showFeedback?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

export function LoadingButton({
  onClick,
  children,
  loadingText = 'Loading...',
  successText,
  errorText,
  showFeedback = false,
  timeout = 10000,
  retryAttempts = 0,
  disabled,
  ...buttonProps
}: LoadingButtonProps) {
  const [feedbackText, setFeedbackText] = useState<string>('');
  
  const { isLoading, execute } = useAsyncOperation({
    timeout,
    retryAttempts,
    onSuccess: () => {
      if (showFeedback && successText) {
        setFeedbackText(successText);
        setTimeout(() => setFeedbackText(''), 2000);
      }
    },
    onError: () => {
      if (showFeedback && errorText) {
        setFeedbackText(errorText);
        setTimeout(() => setFeedbackText(''), 3000);
      }
    }
  });

  const handleClick = () => {
    execute(async () => {
      await onClick();
    });
  };

  const getDisplayText = () => {
    if (feedbackText) return feedbackText;
    if (isLoading) return loadingText;
    return children;
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {getDisplayText()}
    </Button>
  );
}

/**
 * Webhook Card Component
 * Reusable component for displaying webhook information
 */
interface WebhookCardProps {
  webhook: {
    id: string;
    name?: string;
    url: string;
    enabled: boolean;
    lastTriggered?: string | Date | null;
  };
  onToggle: (id: string) => void;
  onTrigger: (webhook: any) => Promise<void>;
  onRemove: (id: string) => void;
  isTriggering?: boolean;
}

export function WebhookCard({
  webhook,
  onToggle,
  onTrigger,
  onRemove,
  isTriggering = false
}: WebhookCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="font-medium">
          {webhook.name || 'Unnamed Webhook'}
        </div>
        <div className="text-sm text-muted-foreground">
          {webhook.url.substring(0, 40)}
          {webhook.url.length > 40 && '...'}
        </div>
        {webhook.lastTriggered && (
          <div className="text-xs text-muted-foreground mt-1">
            Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggle(webhook.id)}
        >
          {webhook.enabled ? 'Disable' : 'Enable'}
        </Button>
        
        <LoadingButton
          variant="outline"
          size="sm"
          onClick={() => onTrigger(webhook)}
          disabled={!webhook.enabled}
          loadingText="Testing..."
          successText="Success!"
          errorText="Failed"
          showFeedback
        >
          Test
        </LoadingButton>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(webhook.id)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}