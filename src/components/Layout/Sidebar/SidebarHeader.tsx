
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, ChevronLeft, ChevronsLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SidebarHeaderProps {
  collapsed: boolean;
  isMobile: boolean;
  toggleCollapse: () => void;
}

export function SidebarHeader({ collapsed, isMobile, toggleCollapse }: SidebarHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 h-14 shrink-0">
        <Link to="/" className="flex items-center font-semibold">
          <Building2 className="h-6 w-6 mr-2" />
          {!collapsed && <span className="text-xl">Client360</span>}
        </Link>
        {!isMobile && (
          <Button variant="ghost" size="sm" onClick={toggleCollapse}>
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <Separator />
    </>
  );
}
