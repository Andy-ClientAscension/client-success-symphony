
import { MoreHorizontal, Calendar, Phone, MessageSquare, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Communication } from "@/lib/data";

interface CommunicationLogProps {
  communications: Communication[];
  clientName?: string;
}

export function CommunicationLog({ communications, clientName }: CommunicationLogProps) {
  const getCommunicationIcon = (type: Communication['type']) => {
    switch (type) {
      case 'email':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'slack':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {clientName ? `${clientName} - Communications` : "Recent Communications"}
        </CardTitle>
        <Button variant="outline" size="sm">
          New Message
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications.length > 0 ? (
            communications.map((comm) => (
              <div key={comm.id} className="flex gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0 bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                  {getCommunicationIcon(comm.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{comm.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(comm.date), 'MMMM dd, yyyy')} • {comm.type}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Follow Up</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-2 text-sm">{comm.summary}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No communications found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
