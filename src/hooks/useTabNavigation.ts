
import { useCallback, useState } from "react";

/**
 * A custom hook to manage tab navigation state.
 * @param defaultTab - the initial tab ID to set as active.
 */
export function useTabNavigation<T extends string>(defaultTab: T) {
  const [activeTab, setActiveTab] = useState<T>(defaultTab);

  const handleTabChange = useCallback((tabId: T) => {
    setActiveTab(tabId);
  }, []);

  return { activeTab, handleTabChange };
}
