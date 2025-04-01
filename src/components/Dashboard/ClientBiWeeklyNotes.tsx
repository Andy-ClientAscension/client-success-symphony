
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { saveData, loadData, STORAGE_KEYS } from "@/utils/persistence";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface BiWeeklyNote {
  id: string;
  clientId: string;
  date: string;
  updatesInteractions: string;
  wins: string;
  struggles: string;
  outreachChannels: string;
  bookedCalls: number;
  healthScore: number;
  notes: string;
  createdBy: string;
}

interface ClientBiWeeklyNotesProps {
  clientId: string;
  clientName: string;
}

export function ClientBiWeeklyNotes({ clientId, clientName }: ClientBiWeeklyNotesProps) {
  const [notes, setNotes] = useState<BiWeeklyNote[]>([]);
  const [currentNote, setCurrentNote] = useState<Partial<BiWeeklyNote>>({
    clientId,
    date: new Date().toISOString(),
    updatesInteractions: "",
    wins: "",
    struggles: "",
    outreachChannels: "",
    bookedCalls: 0,
    healthScore: 7,
    notes: "",
    createdBy: "Current User" // In a real app, get from auth context
  });
  
  const { toast } = useToast();
  
  // Load notes from storage
  useEffect(() => {
    const storedNotes = loadData<BiWeeklyNote[]>(`${STORAGE_KEYS.CLIENT_NOTES}_biweekly_${clientId}`, []);
    if (storedNotes && storedNotes.length > 0) {
      setNotes(storedNotes);
    }
  }, [clientId]);
  
  // Save note to storage
  const saveNote = () => {
    if (!currentNote.updatesInteractions?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide updates/interactions information",
        variant: "destructive",
      });
      return;
    }
    
    const newNote: BiWeeklyNote = {
      ...currentNote as BiWeeklyNote,
      id: Date.now().toString(),
      clientId,
      date: new Date().toISOString(),
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveData(`${STORAGE_KEYS.CLIENT_NOTES}_biweekly_${clientId}`, updatedNotes);
    
    // Reset form
    setCurrentNote({
      clientId,
      date: new Date().toISOString(),
      updatesInteractions: "",
      wins: "",
      struggles: "",
      outreachChannels: "",
      bookedCalls: 0,
      healthScore: 7,
      notes: "",
      createdBy: "Current User"
    });
    
    toast({
      title: "Note Saved",
      description: "Your bi-weekly note has been saved successfully.",
    });
  };
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-600">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Bi-Weekly Notes
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bi-Weekly Notes for {clientName}</SheetTitle>
          <SheetDescription>
            Track client progress on a bi-weekly basis
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">New Bi-Weekly Check-in</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Updates/Interactions</h4>
                <Textarea 
                  placeholder="Recent communications, meetings, etc."
                  value={currentNote.updatesInteractions}
                  onChange={(e) => setCurrentNote({...currentNote, updatesInteractions: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Wins</h4>
                  <Textarea 
                    placeholder="Recent successes"
                    value={currentNote.wins}
                    onChange={(e) => setCurrentNote({...currentNote, wins: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Struggles</h4>
                  <Textarea 
                    placeholder="Current challenges"
                    value={currentNote.struggles}
                    onChange={(e) => setCurrentNote({...currentNote, struggles: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Outreach Channels</h4>
                  <Textarea 
                    placeholder="Email, LinkedIn, etc."
                    value={currentNote.outreachChannels}
                    onChange={(e) => setCurrentNote({...currentNote, outreachChannels: e.target.value})}
                    className="min-h-[60px]"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Booked Calls</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <Button 
                        key={num}
                        variant={currentNote.bookedCalls === num ? "default" : "outline"} 
                        className={`w-10 h-10 p-0 ${currentNote.bookedCalls === num ? "bg-red-600" : ""}`}
                        onClick={() => setCurrentNote({...currentNote, bookedCalls: num})}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Health Score (1-10)</h4>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <Button 
                      key={score}
                      variant={currentNote.healthScore === score ? "default" : "outline"} 
                      className={`w-8 h-8 p-0 ${
                        currentNote.healthScore === score 
                          ? score >= 8 
                            ? "bg-green-600" 
                            : score >= 5 
                              ? "bg-amber-500" 
                              : "bg-red-600"
                          : ""
                      }`}
                      onClick={() => setCurrentNote({...currentNote, healthScore: score})}
                    >
                      {score}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Additional Notes</h4>
                <Textarea 
                  placeholder="Any additional notes or observations..."
                  value={currentNote.notes}
                  onChange={(e) => setCurrentNote({...currentNote, notes: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <Button 
              onClick={saveNote} 
              className="w-full mt-4 bg-red-600 hover:bg-red-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Bi-Weekly Note
            </Button>
          </div>
          
          {notes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-t pt-4">Previous Bi-Weekly Notes</h3>
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="border-red-100">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">
                          {format(new Date(note.date), 'MMMM dd, yyyy')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Health:</span>
                          <span className={`text-lg font-bold ${getHealthScoreColor(note.healthScore)}`}>
                            {note.healthScore}/10
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3 text-sm">
                      <div>
                        <div className="font-medium mb-0.5">Updates/Interactions:</div>
                        <p>{note.updatesInteractions}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="font-medium mb-0.5 flex items-center">
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600" />
                            Wins:
                          </div>
                          <p>{note.wins || "None recorded"}</p>
                        </div>
                        <div>
                          <div className="font-medium mb-0.5 flex items-center">
                            <XCircle className="h-3.5 w-3.5 mr-1 text-red-600" />
                            Struggles:
                          </div>
                          <p>{note.struggles || "None recorded"}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="font-medium mb-0.5">Outreach:</div>
                          <p>{note.outreachChannels || "None recorded"}</p>
                        </div>
                        <div>
                          <div className="font-medium mb-0.5">Booked Calls:</div>
                          <p>{note.bookedCalls}</p>
                        </div>
                      </div>
                      
                      {note.notes && (
                        <div>
                          <div className="font-medium mb-0.5 flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                            Notes:
                          </div>
                          <p>{note.notes}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Recorded by: {note.createdBy}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
