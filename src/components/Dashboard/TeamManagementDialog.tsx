
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
import { useState } from "react";

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
  selectedTeam,
  onConfirm
}: TeamManagementDialogProps) {
  const [teamName, setTeamName] = useState(selectedTeam || "");
  
  const handleConfirm = () => {
    if (actionType === 'add' && teamName.trim()) {
      onConfirm(teamName.trim());
    } else if (actionType === 'delete' && selectedTeam) {
      onConfirm(selectedTeam);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === 'add' ? 'Add New Team' : 'Delete Team'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === 'add' 
              ? 'Enter the name of the new team you want to add.'
              : `Are you sure you want to delete "${selectedTeam}"? This action cannot be undone.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {actionType === 'add' && (
          <div className="py-4">
            <Input
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={actionType === 'delete' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
          >
            {actionType === 'add' ? 'Add Team' : 'Delete Team'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
