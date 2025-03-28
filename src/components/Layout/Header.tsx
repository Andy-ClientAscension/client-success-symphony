
import { Bell, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="border-b bg-white h-16 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients, communications..."
            className="w-full pl-9 bg-background"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-brand-600 rounded-full" />
        </Button>
        <Button size="sm" className="ml-2">
          Connect API
        </Button>
      </div>
    </header>
  );
}
