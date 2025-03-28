
import { Bell, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="border-b bg-white h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients, communications..."
              className="w-full pl-9 bg-background"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="hidden sm:inline-flex">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-600 rounded-full" />
        </Button>
        <Button size="sm" className="hidden sm:inline-flex ml-2 bg-red-600 hover:bg-red-700">
          Connect API
        </Button>
      </div>
    </header>
  );
}
