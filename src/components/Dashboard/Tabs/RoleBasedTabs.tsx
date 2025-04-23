
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTabNavigation } from "@/hooks/useTabNavigation";

export type UserRole = "executive" | "operational" | "analytical";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  roles: UserRole[];
}

interface RoleBasedTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  userRole: UserRole;
  className?: string;
}

export function RoleBasedTabs({ 
  tabs, 
  defaultTab,
  userRole,
  className = "" 
}: RoleBasedTabsProps) {
  // Filter tabs based on user role
  const filteredTabs = tabs.filter(tab => tab.roles.includes(userRole));
  
  // Ensure we have a valid default tab for this role
  const validDefaultTab = defaultTab && filteredTabs.some(tab => tab.id === defaultTab)
    ? defaultTab
    : filteredTabs[0]?.id || "";
  
  const { activeTab, handleTabChange } = useTabNavigation(validDefaultTab);

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className={`w-full ${className}`}
    >
      <TabsList className="mb-4 flex-wrap">
        {filteredTabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="flex items-center space-x-1"
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {filteredTabs.map((tab) => (
        <TabsContent 
          key={tab.id} 
          value={tab.id}
          className="transition-all duration-200"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
