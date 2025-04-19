
import React from 'react';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { focusRingClasses } from '@/lib/accessibility';

interface FormWrapperProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  hideLabel?: boolean;
}

export function FormWrapper({
  id,
  label,
  error,
  required,
  className,
  children,
  hideLabel
}: FormWrapperProps) {
  return (
    <div className={cn("form-field", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "form-label",
          hideLabel && "sr-only",
          error && "text-red-500"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p
          className="mt-1 text-sm text-red-500"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
