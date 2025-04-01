
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionsMenuProps {
  onStatusAction: () => void;
  onTeamAction: () => void;
}

export function BulkActionsMenu({ onStatusAction, onTeamAction }: BulkActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">Bulk Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onStatusAction}>
          Update Status
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTeamAction}>
          Assign Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
