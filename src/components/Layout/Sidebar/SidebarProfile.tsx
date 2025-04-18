
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SidebarProfileProps {
  collapsed: boolean;
  user: any;
  avatarName: string;
  avatarFallbackInitials: string;
}

export function SidebarProfile({ collapsed, user, avatarName, avatarFallbackInitials }: SidebarProfileProps) {
  return (
    <>
      <div className="py-4">
        <div className="px-4 pb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image} alt={avatarName} />
            <AvatarFallback>{avatarFallbackInitials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">{avatarName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </div>
        <Separator />
      </div>
    </>
  );
}
