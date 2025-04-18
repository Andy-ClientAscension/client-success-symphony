
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cpu } from "lucide-react";
import { FocusModeToggle } from "./FocusModeToggle";

interface DashboardSettingsBarProps {
  persistDashboard: boolean;
  togglePersistDashboard: () => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
}

export function DashboardSettingsBar({
  persistDashboard,
  togglePersistDashboard,
  performanceMode,
  setPerformanceMode,
  focusMode,
  onFocusModeChange
}: DashboardSettingsBarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="dashboard-persistence" 
          checked={persistDashboard}
          onCheckedChange={togglePersistDashboard}
          aria-label="Auto-save dashboard settings"
        />
        <Label htmlFor="dashboard-persistence" className="text-sm text-gray-600 dark:text-gray-400">
          Auto-save
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="performance-mode" 
          checked={performanceMode}
          onCheckedChange={setPerformanceMode}
          aria-label="Toggle performance mode"
        />
        <Label htmlFor="performance-mode" className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <Cpu className="h-3.5 w-3.5 mr-1" />
          Performance Mode
        </Label>
      </div>
      
      <FocusModeToggle focusMode={focusMode} onChange={onFocusModeChange} />
    </div>
  );
}
