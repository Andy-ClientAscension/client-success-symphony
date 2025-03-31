
import { Bell, Search, HelpCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { LoadingState } from "@/components/LoadingState";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { FileUp, AlertCircle } from "lucide-react";
import { SearchResults } from "@/components/Search/SearchResults";
import { searchAll } from "@/services/searchService";
import { useDebounce } from "@/hooks/use-debounce";

type ImportFormat = "csv" | "json" | "xlsx";

export function Header() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<ImportFormat>("csv");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleCloseSearch();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(true);
      setFileName(file.name);
      setError(null);
      
      // Validate file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (format === 'csv' && extension !== 'csv') {
        setError("Please select a CSV file.");
        return;
      } else if (format === 'json' && extension !== 'json') {
        setError("Please select a JSON file.");
        return;
      } else if (format === 'xlsx' && !['xlsx', 'xls'].includes(extension || '')) {
        setError("Please select an Excel file.");
        return;
      }
    } else {
      setFileSelected(false);
      setFileName("");
    }
  };

  const handleImport = async () => {
    // For now, we'll simulate the import process
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // In a real implementation, we would parse the file and process the data
      // For this demo, we'll simulate a successful import
      const importedCount = Math.floor(Math.random() * 10) + 5; // Random number between 5-15
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} clients from ${fileName}.`,
      });
      
      // Reset the form and close the dialog
      setFileSelected(false);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
    } catch (err) {
      setError("Failed to import data. Please check your file format and try again.");
      console.error("Import error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="border-b bg-card h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4 w-full">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/be8819c9-875b-4531-a156-fca2f462bc66.png" 
            alt="Client Ascension Logo" 
            className="h-8 md:h-10"
          />
        </div>
        
        <div className="flex-1 max-w-xl hidden sm:block ml-2 md:ml-4">
          <div className="relative">
            <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${isSearching ? 'animate-pulse text-red-600' : 'text-muted-foreground'}`} />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search clients, students, resources..."
              className="w-full pl-9 bg-background pr-4"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
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
        
        {/* Import Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <Upload className="h-3.5 w-3.5 mr-1" /> Import
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Client Data</DialogTitle>
              <DialogDescription>
                Upload a file to import client data into your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="format">Format</Label>
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant={format === "csv" ? "default" : "outline"}
                    onClick={() => setFormat("csv")}
                    className={format === "csv" ? "bg-red-600 hover:bg-red-700" : ""}
                    size="sm"
                  >
                    CSV
                  </Button>
                  <Button 
                    type="button" 
                    variant={format === "json" ? "default" : "outline"}
                    onClick={() => setFormat("json")}
                    className={format === "json" ? "bg-red-600 hover:bg-red-700" : ""}
                    size="sm"
                  >
                    JSON
                  </Button>
                  <Button 
                    type="button" 
                    variant={format === "xlsx" ? "default" : "outline"}
                    onClick={() => setFormat("xlsx")}
                    className={format === "xlsx" ? "bg-red-600 hover:bg-red-700" : ""}
                    size="sm"
                  >
                    Excel
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={format === "csv" 
                      ? ".csv" 
                      : format === "json" 
                        ? ".json" 
                        : ".xlsx,.xls"}
                    className={fileSelected ? "file:text-green-600" : ""}
                  />
                </div>
                {fileName && (
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <FileUp className="h-3 w-3 mr-1" /> {fileName}
                  </p>
                )}
                {error && (
                  <ValidationError message={error} type="error" />
                )}
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">File Format Requirements</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1 space-y-1">
                      <li>Include headers: name, status, progress, endDate</li>
                      <li>Optional fields: csm, callsBooked, dealsClosed, mrr, npsScore</li>
                      <li>Dates should be in YYYY-MM-DD format</li>
                      <li>Status values: active, at-risk, churned, new</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              {isLoading ? (
                <LoadingState message="Importing..." size="sm" />
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleImport}
                    disabled={!fileSelected}
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    Import
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
          Connect API
        </Button>
      </div>
    </header>
  );
}
