
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
  { id: "Team-Andy", name: "Team Andy" },
  { id: "Team-Chris", name: "Team Chris" },
  { id: "Team-Alex", name: "Team Alex" },
  { id: "Team-Cillin", name: "Team Cillin" },
];

interface ClientBulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'status' | 'team' | 'column' | 'delete' | null;
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
  const getTitle = () => {
    switch (actionType) {
      case 'status': return 'Update Status';
      case 'team': return 'Assign Team';
      case 'column': return 'Move to Column';
      case 'delete': return 'Delete Clients';
      default: return 'Bulk Action';
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === 'delete' 
              ? `Are you sure you want to delete ${selectedCount} selected ${selectedCount === 1 ? 'client' : 'clients'}? This action cannot be undone.`
              : `This action will update ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'}. This action cannot be undone.`
            }
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
        
        {actionType === 'column' && (
          <Select onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Students</SelectItem>
              <SelectItem value="backend">Backend Students</SelectItem>
              <SelectItem value="olympia">Olympia Students</SelectItem>
              <SelectItem value="paused">Paused Students</SelectItem>
              <SelectItem value="graduated">Graduated Students</SelectItem>
              <SelectItem value="churned">Churned Students</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={actionType === 'delete' ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {actionType === 'delete' ? 'Delete' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
