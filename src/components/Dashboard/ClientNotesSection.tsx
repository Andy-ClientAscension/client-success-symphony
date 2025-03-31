
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, User } from "lucide-react";
import { format } from "date-fns";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";

interface ClientNote {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
}

interface ClientNotesProps {
  client: Client;
}

export function ClientNotesSection({ client }: ClientNotesProps) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

  // Mock users who can be tagged
  const availableTags = ["@Andy", "@Chris", "@Alex", "@Cillin"];

  // Load notes from storage
  useEffect(() => {
    const storedNotes = loadData(`${STORAGE_KEYS.CLIENT_NOTES}_${client.id}`, []);
    if (storedNotes && storedNotes.length > 0) {
      setNotes(storedNotes);
    }
  }, [client.id]);

  // Save notes to storage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      saveData(`${STORAGE_KEYS.CLIENT_NOTES}_${client.id}`, notes);
    }
  }, [notes, client.id]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const newNoteItem: ClientNote = {
      id: Date.now().toString(),
      text: newNote,
      createdAt: new Date().toISOString(),
      createdBy: "Current User", // In a real app, this would be the logged-in user
      tags: selectedTags,
    };
    
    setNotes([...notes, newNoteItem]);
    setNewNote("");
    setSelectedTags([]);
    
    toast({
      title: "Note Added",
      description: "Your note has been saved successfully.",
    });
  };
  
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  return (
    <Card className="border-red-100">
      <CardHeader>
        <CardTitle>Client Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Textarea 
            placeholder="Add a note about this client..." 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[120px]"
          />
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium">Tag team members:</div>
            {selectedTags.map(tag => (
              <div key={tag} className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full flex items-center gap-1">
                {tag}
                <button 
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-800 hover:text-red-900 focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Type @ to tag"
              value={tagInput}
              onChange={handleTagInputChange}
              className="flex h-8 w-[150px] rounded-md border border-input bg-background px-3 text-xs ring-offset-background"
            />
            
            {tagInput && tagInput.startsWith("@") && (
              <div className="absolute bg-background border border-input rounded-md mt-24 shadow-md z-10">
                {availableTags
                  .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
                  .map(tag => (
                    <div 
                      key={tag} 
                      onClick={() => handleTagSelect(tag)}
                      className="px-3 py-2 hover:bg-muted cursor-pointer"
                    >
                      {tag}
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
        
        <div className="space-y-4 mt-6">
          {notes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No notes yet. Add your first note about this client.
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={note.createdBy} />
                    <AvatarFallback className="bg-red-200 text-red-800">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{note.createdBy}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), 'MMM dd, yyyy - HH:mm')}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm">{note.text}</div>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map(tag => (
                      <div key={tag} className="bg-muted px-2 py-0.5 text-xs rounded-full">
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
