import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Shield, Bell, Mail } from 'lucide-react';

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Database Status</div>
                    <div className="text-sm text-muted-foreground">Active connections</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-medium">Security</div>
                    <div className="text-sm text-muted-foreground">RLS policies active</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Secure
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-muted-foreground">System alerts enabled</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium">Email Service</div>
                    <div className="text-sm text-muted-foreground">SMTP configured</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Connected
                </Badge>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="font-medium mb-2">System Actions</div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Clear Cache
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Backup Database
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Generate Reports
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default User Role</label>
                <div className="text-sm text-muted-foreground">
                  New users are automatically assigned the "user" role
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Verification</label>
                <div className="text-sm text-muted-foreground">
                  Email verification is required for new accounts
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Timeout</label>
                <div className="text-sm text-muted-foreground">
                  Users are logged out after 24 hours of inactivity
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Retention</label>
                <div className="text-sm text-muted-foreground">
                  User data is retained for 7 years per compliance requirements
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}