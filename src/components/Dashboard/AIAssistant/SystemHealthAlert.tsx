
import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { SystemHealthCheck } from './types';
import { cn } from '@/lib/utils';

interface SystemHealthAlertProps {
  healthCheck: SystemHealthCheck;
  onDismiss?: () => void;
}

export const SystemHealthAlert = React.memo(({ 
  healthCheck, 
  onDismiss 
}: SystemHealthAlertProps) => {
  const { type, message, severity } = healthCheck;
  
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10';
      case 'warning':
        return 'bg-amber-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return 'border-destructive/20';
      case 'warning':
        return 'border-amber-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-gray-200';
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-amber-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };
  
  return (
    <div className={cn(
      "flex items-start space-x-3 rounded-md border p-3 text-sm mb-3",
      getBgColor(),
      getBorderColor()
    )}>
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <div className={cn("font-medium", getTextColor())}>
          {severity === 'high' ? 'High Priority: ' : severity === 'medium' ? 'Medium Priority: ' : ''}
          {message}
        </div>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
export default SystemHealthAlert;
