
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface ClientSearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}

export function ClientSearchBar({
  value,
  onChange,
  className,
  placeholder = "Search clients..."
}: ClientSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        className="pl-9"
        placeholder={placeholder}
        aria-label="Search clients"
      />
    </div>
  );
}
