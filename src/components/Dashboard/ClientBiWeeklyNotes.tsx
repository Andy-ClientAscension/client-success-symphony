
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon } from "lucide-react";
import { updateHealthFromNotes } from "@/utils/healthScoreUtils";
import { HealthScoreIndicator } from "@/components/StudentHealth/HealthScoreIndicator";

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
    createdBy: "Current User", // In a real app, get from auth context
  });
  const [studentHealth, setStudentHealth] = useState<StudentHealth.StudentHealthData | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    loadNotes();
  }, [clientId]);
  
  const loadNotes = () => {
    const storedNotes = loadData<BiWeeklyNote[]>(`${STORAGE_KEYS.CLIENT_NOTES}_biweekly_${clientId}`, []);
    if (storedNotes && storedNotes.length > 0) {
      setNotes(storedNotes);
    }
  };
  
  const loadStudentHealth = () => {
    // Load current student health data if available
    const healthData = loadData<StudentHealth.StudentHealthData>(
      `${STORAGE_KEYS.STUDENT_HEALTH}_${clientId}`,
      null
    );
    
    if (healthData) {
      setStudentHealth(healthData);
    }
  };
  
  useEffect(() => {
    loadStudentHealth();
  }, [clientId]);
  
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
      date: new Date().toISOString()
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveData(`${STORAGE_KEYS.CLIENT_NOTES}_biweekly_${clientId}`, updatedNotes);
    
    // Update the student health score based on the new note
    const healthData = updateHealthFromNotes(clientId, updatedNotes);
    setStudentHealth(healthData);
    
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
      description: "Your bi-weekly note has been saved and health score updated.",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
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
          {studentHealth && (
            <div className="mb-4">
              <HealthScoreIndicator 
                score={studentHealth.currentScore}
                previousScore={notes.length > 0 ? notes[notes.length - 1].healthScore * 10 : undefined}
                size="sm"
              />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Health score is calculated automatically from your notes
              </p>
            </div>
          )}
          
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
                  <Input 
                    placeholder="Email, LinkedIn, etc."
                    value={currentNote.outreachChannels}
                    onChange={(e) => setCurrentNote({...currentNote, outreachChannels: e.target.value})}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Booked Calls</h4>
                  <Input 
                    type="number"
                    min="0"
                    value={currentNote.bookedCalls}
                    onChange={(e) => setCurrentNote({...currentNote, bookedCalls: Number(e.target.value)})}
                    placeholder="Enter number of booked calls"
                  />
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
              className="w-full mt-4"
            >
              Save Bi-Weekly Note
            </Button>
          </div>
          
          {notes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-t pt-4">Previous Bi-Weekly Notes</h3>
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {format(new Date(note.date), 'MMMM dd, yyyy')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3 text-sm">
                      <div>
                        <div className="font-medium mb-0.5">Updates/Interactions:</div>
                        <p>{note.updatesInteractions}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="font-medium mb-0.5">Wins:</div>
                          <p>{note.wins || "None recorded"}</p>
                        </div>
                        <div>
                          <div className="font-medium mb-0.5">Struggles:</div>
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
                          <div className="font-medium mb-0.5">Notes:</div>
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
