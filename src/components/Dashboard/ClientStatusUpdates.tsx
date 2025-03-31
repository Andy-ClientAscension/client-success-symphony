
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Client, updateClientStatusById } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";

interface ClientStatusUpdatesProps {
  client: Client;
}

interface StatusUpdates {
  trustPilotReview: {
    completed: boolean;
    date: string | null;
    rating: number | null;
    link: string | null;
    notes: string;
  };
  caseStudyInterview: {
    completed: boolean;
    scheduledDate: string | null;
    conducted: boolean;
    notes: string;
  };
}

export function ClientStatusUpdates({ client }: ClientStatusUpdatesProps) {
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdates>({
    trustPilotReview: {
      completed: !!client.trustPilotReview?.date,
      date: client.trustPilotReview?.date || null,
      rating: client.trustPilotReview?.rating || null,
      link: client.trustPilotReview?.link || null,
      notes: ""
    },
    caseStudyInterview: {
      completed: client.caseStudyInterview?.completed || false,
      scheduledDate: client.caseStudyInterview?.scheduledDate || null,
      conducted: client.caseStudyInterview?.completed || false,
      notes: client.caseStudyInterview?.notes || ""
    }
  });
  
  const [date, setDate] = useState<Date | undefined>(
    client.caseStudyInterview?.scheduledDate 
      ? new Date(client.caseStudyInterview.scheduledDate) 
      : undefined
  );
  
  const [trustPilotDate, setTrustPilotDate] = useState<Date | undefined>(
    client.trustPilotReview?.date 
      ? new Date(client.trustPilotReview.date) 
      : undefined
  );
  
  const { toast } = useToast();

  // Load status updates from storage
  useEffect(() => {
    const storedUpdates = loadData(`${STORAGE_KEYS.CLIENT_STATUS}_${client.id}`, null);
    if (storedUpdates) {
      setStatusUpdates(storedUpdates);
      
      if (storedUpdates.caseStudyInterview.scheduledDate) {
        setDate(new Date(storedUpdates.caseStudyInterview.scheduledDate));
      }
      
      if (storedUpdates.trustPilotReview.date) {
        setTrustPilotDate(new Date(storedUpdates.trustPilotReview.date));
      }
    }
  }, [client.id]);

  // Save status updates to storage whenever they change
  useEffect(() => {
    saveData(`${STORAGE_KEYS.CLIENT_STATUS}_${client.id}`, statusUpdates);
  }, [statusUpdates, client.id]);

  const handleTrustPilotToggle = (checked: boolean) => {
    setStatusUpdates(prev => ({
      ...prev,
      trustPilotReview: {
        ...prev.trustPilotReview,
        completed: checked,
        date: checked ? (trustPilotDate ? format(trustPilotDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')) : null
      }
    }));
  };

  const handleCaseStudyToggle = (checked: boolean) => {
    setStatusUpdates(prev => ({
      ...prev,
      caseStudyInterview: {
        ...prev.caseStudyInterview,
        completed: checked
      }
    }));
  };
  
  const handleCaseStudyConductedToggle = (checked: boolean) => {
    setStatusUpdates(prev => ({
      ...prev,
      caseStudyInterview: {
        ...prev.caseStudyInterview,
        conducted: checked
      }
    }));
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    if (selectedDate) {
      setStatusUpdates(prev => ({
        ...prev,
        caseStudyInterview: {
          ...prev.caseStudyInterview,
          scheduledDate: format(selectedDate, 'yyyy-MM-dd')
        }
      }));
    }
  };
  
  const handleTrustPilotDateSelect = (selectedDate: Date | undefined) => {
    setTrustPilotDate(selectedDate);
    
    if (selectedDate) {
      setStatusUpdates(prev => ({
        ...prev,
        trustPilotReview: {
          ...prev.trustPilotReview,
          date: format(selectedDate, 'yyyy-MM-dd')
        }
      }));
    }
  };
  
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rating = parseInt(e.target.value);
    if (rating >= 1 && rating <= 5) {
      setStatusUpdates(prev => ({
        ...prev,
        trustPilotReview: {
          ...prev.trustPilotReview,
          rating
        }
      }));
    }
  };
  
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusUpdates(prev => ({
      ...prev,
      trustPilotReview: {
        ...prev.trustPilotReview,
        link: e.target.value
      }
    }));
  };
  
  const handleTrustPilotNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStatusUpdates(prev => ({
      ...prev,
      trustPilotReview: {
        ...prev.trustPilotReview,
        notes: e.target.value
      }
    }));
  };
  
  const handleCaseStudyNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStatusUpdates(prev => ({
      ...prev,
      caseStudyInterview: {
        ...prev.caseStudyInterview,
        notes: e.target.value
      }
    }));
  };
  
  const handleSaveChanges = () => {
    const updatedClient: Partial<Client> = {
      ...client,
      trustPilotReview: {
        date: statusUpdates.trustPilotReview.date,
        rating: statusUpdates.trustPilotReview.rating,
        link: statusUpdates.trustPilotReview.link
      },
      caseStudyInterview: {
        completed: statusUpdates.caseStudyInterview.conducted,
        scheduledDate: statusUpdates.caseStudyInterview.scheduledDate,
        notes: statusUpdates.caseStudyInterview.notes
      }
    };
    
    // In a real app, this would update the backend
    // For now, we'll just update the local storage
    
    toast({
      title: "Status Updated",
      description: "Client status has been updated successfully.",
    });
  };

  return (
    <Card className="border-red-100">
      <CardHeader>
        <CardTitle>Status Updates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* TrustPilot Review Section */}
        <div className="space-y-4 p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">TrustPilot Review</h3>
            <div className="flex items-center space-x-2">
              <Switch 
                id="trustpilot" 
                checked={statusUpdates.trustPilotReview.completed}
                onCheckedChange={handleTrustPilotToggle}
              />
              <Label htmlFor="trustpilot">
                {statusUpdates.trustPilotReview.completed ? "Completed" : "Not Completed"}
              </Label>
            </div>
          </div>
          
          {statusUpdates.trustPilotReview.completed && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date Received</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {trustPilotDate ? format(trustPilotDate, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={trustPilotDate}
                        onSelect={handleTrustPilotDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <input 
                    type="number" 
                    min="1" 
                    max="5"
                    value={statusUpdates.trustPilotReview.rating || ""}
                    onChange={handleRatingChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Link to Review</Label>
                  <input 
                    type="text"
                    placeholder="https://..."
                    value={statusUpdates.trustPilotReview.link || ""}
                    onChange={handleLinkChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Add notes about the TrustPilot review..."
                  value={statusUpdates.trustPilotReview.notes}
                  onChange={handleTrustPilotNotesChange}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Case Study Interview Section */}
        <div className="space-y-4 p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Case Study Interview</h3>
            <div className="flex items-center space-x-2">
              <Switch 
                id="casestudy" 
                checked={statusUpdates.caseStudyInterview.completed}
                onCheckedChange={handleCaseStudyToggle}
              />
              <Label htmlFor="casestudy">
                {statusUpdates.caseStudyInterview.completed ? "Scheduled" : "Not Scheduled"}
              </Label>
            </div>
          </div>
          
          {statusUpdates.caseStudyInterview.completed && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="conducted" 
                    checked={statusUpdates.caseStudyInterview.conducted}
                    onCheckedChange={handleCaseStudyConductedToggle}
                  />
                  <Label htmlFor="conducted">
                    Interview {statusUpdates.caseStudyInterview.conducted ? "Conducted" : "Pending"}
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Add notes about the case study interview..."
                  value={statusUpdates.caseStudyInterview.notes}
                  onChange={handleCaseStudyNotesChange}
                />
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSaveChanges} 
          className="bg-red-600 hover:bg-red-700"
        >
          Save Status Changes
        </Button>
      </CardContent>
    </Card>
  );
}
