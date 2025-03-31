
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { differenceInDays } from "date-fns";
import { Client, getAllClients } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function RenewalNotifier() {
  const [upcomingRenewals, setUpcomingRenewals] = useState<Client[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check for upcoming renewals (contracts ending in the next 30 days)
  useEffect(() => {
    const clients = getAllClients();
    const today = new Date();
    
    const renewals = clients.filter(client => {
      const endDate = new Date(client.endDate);
      const daysRemaining = differenceInDays(endDate, today);
      return daysRemaining >= 0 && daysRemaining <= 30;
    });
    
    setUpcomingRenewals(renewals);
    
    // Show toast notification if there are upcoming renewals
    if (renewals.length > 0) {
      toast({
        title: "Upcoming Contract Renewals",
        description: `You have ${renewals.length} clients with contracts ending in the next 30 days.`,
      });
    }
  }, []);
  
  const handleViewClient = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {upcomingRenewals.length > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-[10px] flex items-center justify-center bg-red-600">
              {upcomingRenewals.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuLabel>Upcoming Renewals</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {upcomingRenewals.length > 0 ? (
          <DropdownMenuGroup className="max-h-64 overflow-auto">
            {upcomingRenewals.map(client => {
              const daysRemaining = differenceInDays(new Date(client.endDate), new Date());
              return (
                <DropdownMenuItem key={client.id} onSelect={() => handleViewClient(client.id)}>
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{client.name}</span>
                      <Badge 
                        variant="outline"
                        className={daysRemaining <= 7 ? "text-red-600 border-red-600" : "text-amber-600 border-amber-600"}
                      >
                        {daysRemaining} days
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {client.csm || 'Unassigned CSM'}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No upcoming renewals in the next 30 days
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
