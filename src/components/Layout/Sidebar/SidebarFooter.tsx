
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SidebarFooterProps {
  collapsed: boolean;
  handleSignOut: () => void;
}

export function SidebarFooter({ collapsed, handleSignOut }: SidebarFooterProps) {
  return (
    <>
      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </>
  );
}
