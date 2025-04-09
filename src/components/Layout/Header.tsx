import { Bell, Search, HelpCircle, Upload, UserSearch, FileSearch, KeySquare, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { SearchResults } from "@/components/Search/SearchResults";
import { searchAll } from "@/services/searchService";
import { useDebounce } from "@/hooks/use-debounce";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ImportData } from "@/components/Dashboard/ImportData";
import { useNavigate } from "react-router-dom";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";

export interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarVisible?: boolean;
  sidebarCollapsed?: boolean;
}

export function Header({ toggleSidebar, sidebarVisible, sidebarCollapsed }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else if (e.key === "Escape" && showResults) {
        setShowResults(false);
      } else if (e.key === "/" || (e.key === "p" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [showResults]);

  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 2) {
      setIsSearching(true);
      setShowResults(true);
      setTimeout(() => {
        try {
          const results = searchAll(debouncedSearchQuery);
          console.log('Search results:', results);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          toast({
            title: "Search Error",
            description: "There was a problem with your search. Please try again.",
            variant: "destructive"
          });
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 600);
    } else {
      if (debouncedSearchQuery.trim().length <= 2 && !isSearching) {
        setSearchResults([]);
      }
    }
  }, [debouncedSearchQuery, toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length > 2 && !showResults) {
      setShowResults(true);
      setIsSearching(true);
    }
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

  const handleCommandSelect = (type: string) => {
    switch (type) {
      case "clients":
        navigate("/clients");
        break;
      case "communications":
        navigate("/communications");
        break;
      case "analytics":
        navigate("/analytics");
        break;
      case "payments":
        navigate("/payments");
        break;
      case "renewals":
        navigate("/renewals");
        break;
      case "help":
        navigate("/help");
        break;
      default:
        break;
    }
    setCommandOpen(false);
  };

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
        
        <div className="flex-1 max-w-xl hidden sm:block relative">
          <div className="relative">
            {isSearching ? (
              <Loader className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search clients, students, resources..."
              className="w-full pl-10 pr-20 ring-offset-background transition-all focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              aria-label="Global search"
            />
            
            {searchQuery ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleCloseSearch}
                aria-label="Clear search"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <KeySquare className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
                <span className="text-xs text-muted-foreground opacity-70">Ctrl+K</span>
              </div>
            )}
            
            {showResults && (
              <div className="search-results">
                <SearchResults 
                  results={searchResults}
                  isOpen={showResults}
                  onClose={handleCloseSearch}
                  searchQuery={searchQuery}
                  isSearching={isSearching}
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
        
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white ml-2"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="h-3.5 w-3.5 mr-1" /> Import
            </Button>
          </DialogTrigger>
          <ImportData />
        </Dialog>
        
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white ml-1">
          Connect API
        </Button>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center">
              <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No results found</p>
            </div>
          </CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleCommandSelect("clients")}>
              <UserSearch className="mr-2 h-4 w-4" />
              <span>Clients</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect("communications")}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Communications</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect("analytics")}>
              <FileSearch className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Search Categories">
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <UserSearch className="mr-2 h-4 w-4" />
              <span>Find SSCs</span>
            </CommandItem>
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <FileSearch className="mr-2 h-4 w-4" />
              <span>Find Resources</span>
            </CommandItem>
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <Search className="mr-2 h-4 w-4" />
              <span>Find Students</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
