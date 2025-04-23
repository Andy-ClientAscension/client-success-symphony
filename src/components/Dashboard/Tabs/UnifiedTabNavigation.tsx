
import React from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface UnifiedTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function UnifiedTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = ""
}: UnifiedTabNavigationProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium text-sm focus:outline-none transition-colors
              ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            onClick={() => onTabChange(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
            aria-controls={`${tab.id}-content`}
            id={`${tab.id}-tab`}
          >
            <div className="flex items-center space-x-2">
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel" aria-labelledby={`${activeTab}-tab`} id={`${activeTab}-content`}>
        {children}
      </div>
    </div>
  );
}
