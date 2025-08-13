import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, User, Calendar, Target } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'client' | 'navigation' | 'action';
  path?: string;
  action?: () => void;
  icon: React.ComponentType<any>;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Search clients...", className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { allClients, isLoading } = useDashboardData({ enableAutoSync: false });

  // Navigation items for search
  const navigationItems: SearchResult[] = [
    { id: 'nav-clients', title: 'Clients', subtitle: 'View all clients', type: 'navigation', path: '/clients', icon: User },
    { id: 'nav-analytics', title: 'Analytics', subtitle: 'Business insights', type: 'navigation', path: '/analytics', icon: Target },
    { id: 'nav-renewals', title: 'Renewals', subtitle: 'Contract renewals', type: 'navigation', path: '/renewals', icon: Calendar },
  ];

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search clients
    const clientResults = allClients
      .filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.team?.toLowerCase().includes(query) ||
        client.status?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(client => ({
        id: `client-${client.id}`,
        title: client.name,
        subtitle: `${client.status || 'No status'} • ${client.team || 'No team'}`,
        type: 'client' as const,
        path: `/clients/${client.id}`,
        icon: User
      }));

    // Search navigation
    const navResults = navigationItems
      .filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query)
      )
      .slice(0, 3);

    // Combine results with clients first
    searchResults.push(...clientResults, ...navResults);
    setResults(searchResults.slice(0, 8)); // Limit total results
  }, [allClients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setResults([]);
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!results.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.path) {
      navigate(result.path);
    }
    
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show results when focused and has query
  useEffect(() => {
    setIsOpen(query.length > 0 && results.length > 0);
  }, [query, results]);

  return (
    <div className={cn("relative", className)} ref={resultsRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 transition-colors",
                      index === selectedIndex && "bg-muted"
                    )}
                    onClick={() => handleResultSelect(result)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {result.type}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.length > 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}