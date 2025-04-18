
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'add' | 'delete';
  selectedTeam?: string;
  onConfirm: (teamName: string) => void;
}

export function TeamManagementDialog({
  open,
  onOpenChange,
  actionType,
  selectedTeam = "",
  onConfirm
}: TeamManagementDialogProps) {
  const [teamName, setTeamName] = useState(selectedTeam);

  const handleConfirm = () => {
    if (actionType === 'add' && !teamName.trim()) {
      return; // Don't allow empty team names
    }
    
    onConfirm(actionType === 'delete' ? selectedTeam : teamName);
  };

  React.useEffect(() => {
    if (open && actionType === 'delete') {
      setTeamName(selectedTeam);
    } else if (open && actionType === 'add') {
      setTeamName("");
    }
  }, [open, actionType, selectedTeam]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === 'add' ? 'Add New Team' : 'Delete Team'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === 'add' 
              ? 'Enter a name for the new team.'
              : `Are you sure you want to delete "${selectedTeam}"? This action cannot be undone.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {actionType === 'add' && (
          <div className="py-4">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="mt-2"
              autoFocus
            />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={actionType === 'delete' ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {actionType === 'add' ? 'Add Team' : 'Delete Team'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
