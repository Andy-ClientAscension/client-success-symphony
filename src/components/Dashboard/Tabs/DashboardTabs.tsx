
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
  }[];
}

export function DashboardTabs({ activeTab, setActiveTab, tabs }: DashboardTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="flex flex-wrap w-full mb-6">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2"
            data-testid={`tab-${tab.id}`}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          tabIndex={0}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-testid={`tab-content-${tab.id}`}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
