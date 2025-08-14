import { useState, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings, Volume2, VolumeX } from 'lucide-react';

interface NotificationSettings {
  enabled: boolean;
  showAuth: boolean;
  showSystem: boolean;
  showErrors: boolean;
  showSuccess: boolean;
  showDataUpdates: boolean;
  priority: 'all' | 'high' | 'critical';
  maxPerMinute: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  showAuth: true,
  showSystem: true,
  showErrors: true,
  showSuccess: false, // Disable success by default to reduce noise
  showDataUpdates: false, // Disable data updates by default
  priority: 'high',
  maxPerMinute: 5
};

export function NotificationCenter() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = useCallback(<K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
  }, [settings]);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('notification_settings', JSON.stringify(DEFAULT_SETTINGS));
  }, []);

  const toggleQuietMode = useCallback(() => {
    const quietMode = !settings.enabled;
    updateSetting('enabled', quietMode);
  }, [settings.enabled, updateSetting]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50"
        >
          {settings.enabled ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          <Badge 
            variant={settings.enabled ? "default" : "secondary"} 
            className="ml-2 text-xs"
          >
            {settings.enabled ? 'ON' : 'OFF'}
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <CardTitle className="text-sm">Notifications</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          <CardDescription className="text-xs">
            Control your notification preferences
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.enabled ? (
                <Volume2 className="h-4 w-4 text-green-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-red-600" />
              )}
              <Label htmlFor="notifications-enabled" className="text-sm font-medium">
                {settings.enabled ? 'Notifications On' : 'Quiet Mode'}
              </Label>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Priority Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Priority Level</Label>
                <Select
                  value={settings.priority}
                  onValueChange={(value: 'all' | 'high' | 'critical') => 
                    updateSetting('priority', value)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="high">High & Critical Only</SelectItem>
                    <SelectItem value="critical">Critical Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Toggles */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Categories</Label>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-errors" className="text-xs">Errors & Warnings</Label>
                    <Switch
                      id="show-errors"
                      checked={settings.showErrors}
                      onCheckedChange={(checked) => updateSetting('showErrors', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-auth" className="text-xs">Authentication</Label>
                    <Switch
                      id="show-auth"
                      checked={settings.showAuth}
                      onCheckedChange={(checked) => updateSetting('showAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-system" className="text-xs">System Updates</Label>
                    <Switch
                      id="show-system"
                      checked={settings.showSystem}
                      onCheckedChange={(checked) => updateSetting('showSystem', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-success" className="text-xs">Success Messages</Label>
                    <Switch
                      id="show-success"
                      checked={settings.showSuccess}
                      onCheckedChange={(checked) => updateSetting('showSuccess', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-data" className="text-xs">Data Updates</Label>
                    <Switch
                      id="show-data"
                      checked={settings.showDataUpdates}
                      onCheckedChange={(checked) => updateSetting('showDataUpdates', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Max per minute: {settings.maxPerMinute}
                </Label>
                <Select
                  value={settings.maxPerMinute.toString()}
                  onValueChange={(value) => updateSetting('maxPerMinute', parseInt(value))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 (Minimal)</SelectItem>
                    <SelectItem value="5">5 (Balanced)</SelectItem>
                    <SelectItem value="10">10 (More)</SelectItem>
                    <SelectItem value="20">20 (All)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="w-full text-xs"
          >
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}