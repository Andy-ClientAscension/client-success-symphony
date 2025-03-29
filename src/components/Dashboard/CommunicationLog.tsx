
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
        <CardTitle className="text-red-600">
          {clientName ? `${clientName} - Communications` : "Recent Communications"}
        </CardTitle>
        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 dark:border-red-800">
          New Message
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications.length > 0 ? (
            communications.map((comm) => (
              <div key={comm.id} className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-shrink-0 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 w-10 h-10 rounded-full flex items-center justify-center">
                  {getCommunicationIcon(comm.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">{comm.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(comm.date), 'MMMM dd, yyyy')} • <span className="text-blue-600 dark:text-blue-400">{comm.type}</span>
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-blue-600 dark:text-blue-400">View Details</DropdownMenuItem>
                        <DropdownMenuItem>Follow Up</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{comm.summary}</p>
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
