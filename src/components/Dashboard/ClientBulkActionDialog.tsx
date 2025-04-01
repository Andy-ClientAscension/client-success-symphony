
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/lib/data";

const TEAMS = [
  { id: "Team-Andy", name: "Team-Andy" },
  { id: "Team-Chris", name: "Team-Chris" },
  { id: "Team-Alex", name: "Team-Alex" },
  { id: "Team-Cillin", name: "Team-Cillin" },
];

interface ClientBulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'status' | 'team' | null;
  selectedCount: number;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
}

export function ClientBulkActionDialog({
  open,
  onOpenChange,
  actionType,
  selectedCount,
  onValueChange,
  onConfirm
}: ClientBulkActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === 'status' ? 'Update Status' : 'Assign Team'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will update {selectedCount} selected clients. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {actionType === 'status' && (
          <Select onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {actionType === 'team' && (
          <Select onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {TEAMS.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
