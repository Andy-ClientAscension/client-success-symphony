
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTabNavigation } from "@/hooks/useTabNavigation";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface DashboardTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function DashboardTabs({ 
  tabs, 
  defaultTab = tabs[0]?.id || "",
  className = "" 
}: DashboardTabsProps) {
  const { activeTab, handleTabChange } = useTabNavigation(defaultTab);

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className={`w-full ${className}`}
    >
      <TabsList className="mb-4 flex-wrap">
        {tabs.map((tab) => (
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
      {tabs.map((tab) => (
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
