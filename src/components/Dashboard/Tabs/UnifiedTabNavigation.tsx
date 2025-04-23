
import React from "react";

interface Tab {
  id: string;
  label: string;
}

interface UnifiedTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export function UnifiedTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  children
}: UnifiedTabNavigationProps) {
  return (
    <div className="dashboard-tabs-container">
      <ul className="tab-list flex gap-2 border-b" role="tablist">
        {tabs.map(tab => (
          <li key={tab.id} role="presentation">
            <button
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`tab-button px-4 py-2 rounded-t transition-colors ${activeTab === tab.id ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'} focus:outline-none`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <div
        className="tab-content py-4"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
