/**
 * Form Field Components
 * Reusable form components with built-in validation and error handling
 */

import { useState, useCallback } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, AlertCircle } from 'lucide-react';

interface ValidatedInputProps extends Omit<InputProps, 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  validator?: (value: string) => string | null;
  debounceMs?: number;
  showValidation?: boolean;
  required?: boolean;
}

export function ValidatedInput({
  label,
  value,
  onChange,
  validator,
  debounceMs = 300,
  showValidation = true,
  required = false,
  ...inputProps
}: ValidatedInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const validateInput = useCallback((inputValue: string) => {
    if (required && !inputValue.trim()) {
      setError('This field is required');
      setIsValid(false);
      return;
    }

    if (validator) {
      const validationError = validator(inputValue);
      setError(validationError);
      setIsValid(validationError === null);
    } else {
      setError(null);
      setIsValid(inputValue.length > 0);
    }
  }, [validator, required]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout for validation
    const timeout = setTimeout(() => {
      validateInput(newValue);
    }, debounceMs);

    setDebounceTimeout(timeout);
  };

  const getValidationIcon = () => {
    if (!showValidation || isValid === null) return null;
    
    return isValid ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={inputProps.id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          {...inputProps}
          value={value}
          onChange={handleChange}
          className={`${inputProps.className || ''} ${
            showValidation && isValid !== null
              ? isValid
                ? 'border-green-500'
                : 'border-red-500'
              : ''
          }`}
        />
        
        {showValidation && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * URL Input with automatic validation
 */
interface UrlInputProps extends Omit<ValidatedInputProps, 'validator'> {
  allowedDomains?: string[];
}

export function UrlInput({ allowedDomains, ...props }: UrlInputProps) {
  const urlValidator = useCallback((value: string): string | null => {
    if (!value) return null;

    try {
      const url = new URL(value);
      
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'URL must use HTTP or HTTPS protocol';
      }

      if (allowedDomains && !allowedDomains.some(domain => url.hostname.includes(domain))) {
        return `URL must be from one of: ${allowedDomains.join(', ')}`;
      }

      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }, [allowedDomains]);

  return (
    <ValidatedInput
      {...props}
      validator={urlValidator}
      placeholder={props.placeholder || 'https://example.com/webhook'}
    />
  );
}

/**
 * Form Section Component
 */
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-4">
      <div 
        className={`${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}