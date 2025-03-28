
import { useState, useRef, useEffect } from "react";
import { MessageSquare, AtSign, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  mentions?: string[];
}

interface StudentNotesProps {
  studentId: string;
  studentName: string;
  notes: Note[];
  onAddNote: (studentId: string, note: Omit<Note, "id" | "timestamp">) => void;
}

export function StudentNotes({ studentId, studentName, notes, onAddNote }: StudentNotesProps) {
  const [noteText, setNoteText] = useState("");
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const handleSubmit = () => {
    if (noteText.trim()) {
      const mentions = extractMentions(noteText);
      
      onAddNote(studentId, {
        text: noteText,
        author: "Current User", // In a real app, this would come from auth
        mentions: mentions.length > 0 ? mentions : undefined
      });
      
      setNoteText("");
      
      // Show notification for mentions
      if (mentions.length > 0) {
        toast({
          title: "Mentions",
          description: `Notified ${mentions.map(m => '@' + m).join(', ')}`,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey === false && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Format the note text with highlighted mentions
  const formatNoteWithMentions = (text: string) => {
    return text.replace(/@(\w+)/g, '<span class="text-red-600 font-medium">@$1</span>');
  };

  return (
    <div className="mt-4 border border-red-100 rounded-md p-3">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-red-600" />
        <h4 className="font-medium">Notes for {studentName}</h4>
      </div>
      
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-3">No notes yet. Add the first note!</p>
      ) : (
        <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="bg-slate-50 p-2 rounded-md">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{note.author}</span>
                <span className="text-xs text-muted-foreground">{new Date(note.timestamp).toLocaleString()}</span>
              </div>
              <p 
                className="text-sm mt-1"
                dangerouslySetInnerHTML={{ __html: formatNoteWithMentions(note.text) }}
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note... Use @username to mention team members"
            className="min-h-[60px] pr-8"
          />
          <AtSign 
            className="absolute right-2 bottom-2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-red-600"
            onClick={() => {
              if (textareaRef.current) {
                textareaRef.current.focus();
                setNoteText(noteText + "@");
              }
            }}
          />
        </div>
        <Button 
          size="sm" 
          className="bg-red-600 hover:bg-red-700"
          onClick={handleSubmit}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
