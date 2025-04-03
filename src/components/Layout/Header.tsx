
import { Bell, Search, HelpCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileUp } from "lucide-react";
import { SearchResults } from "@/components/Search/SearchResults";
import { searchAll } from "@/services/searchService";
import { useDebounce } from "@/hooks/use-debounce";

interface HeaderProps {
  toggleSidebar?: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 2) {
      setIsSearching(true);
      const results = searchAll(debouncedSearchQuery);
      setSearchResults(results);
      setShowResults(true);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCloseSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    setSearchResults([]);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 2) {
      setShowResults(true);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.search-results')
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="border-b bg-white dark:bg-gray-900 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center">
          {toggleSidebar && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="mr-2 text-gray-600 dark:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          <img 
            src="/lovable-uploads/be8819c9-875b-4531-a156-fca2f462bc66.png" 
            alt="Client Ascension Logo" 
            className="h-8"
          />
        </div>
        
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isSearching ? 'animate-pulse text-red-600' : 'text-muted-foreground'}`} />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search clients, students, resources..."
              className="w-full pl-10 pr-4"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleCloseSearch}
              >
                <span className="sr-only">Clear search</span>
                <FileUp className="h-4 w-4 rotate-45" />
              </Button>
            )}
            {showResults && (
              <div className="search-results">
                <SearchResults 
                  results={searchResults}
                  isOpen={showResults}
                  onClose={handleCloseSearch}
                  searchQuery={searchQuery}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="icon" className="hidden sm:inline-flex">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-600 rounded-full" />
        </Button>
        
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white ml-2">
          <Upload className="h-3.5 w-3.5 mr-1" /> Import
        </Button>
        
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white ml-1">
          Connect API
        </Button>
      </div>
    </header>
  );
}
