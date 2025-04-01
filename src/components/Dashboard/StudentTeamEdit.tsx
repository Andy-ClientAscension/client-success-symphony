
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CSM_TEAMS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";

interface StudentTeamEditProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamId: string) => void;
  studentName: string;
  studentId: string;
  currentTeam?: string;
}

export function StudentTeamEdit({
  isOpen,
  onClose,
  onSubmit,
  studentName,
  studentId,
  currentTeam = "all",
}: StudentTeamEditProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(currentTeam);
  const { toast } = useToast();

  useEffect(() => {
    if (currentTeam) {
      setSelectedTeam(currentTeam);
    }
  }, [currentTeam]);

  const handleSubmit = () => {
    if (currentTeam !== selectedTeam) {
      // Update team assignment
      onSubmit(selectedTeam);

      // Transfer bi-weekly notes to the new team
      transferBiWeeklyNotes(studentId, currentTeam, selectedTeam);

      toast({
        title: "Team Assignment Updated",
        description: `${studentName} is now assigned to ${CSM_TEAMS.find(team => team.id === selectedTeam)?.name || selectedTeam}`,
      });
    }
    onClose();
  };

  const transferBiWeeklyNotes = (studentId: string, oldTeam: string, newTeam: string) => {
    // Load bi-weekly notes for this student
    const notesKey = `${STORAGE_KEYS.CLIENT_NOTES}_biweekly_${studentId}`;
    const studentNotes = loadData(notesKey, []);

    if (studentNotes.length > 0) {
      // Update team information in the notes
      const updatedNotes = studentNotes.map((note: any) => ({
        ...note,
        team: newTeam
      }));

      // Save updated notes
      saveData(notesKey, updatedNotes);
      
      console.log(`Transferred ${studentNotes.length} bi-weekly notes from ${oldTeam} to ${newTeam}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign CSM Team for {studentName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="team">Select CSM Team</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {CSM_TEAMS.filter(team => team.id !== "all").map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleSubmit}>Save Assignment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
