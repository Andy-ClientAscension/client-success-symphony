import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Key, Globe, Users, FileText, RefreshCw, Link, AlertTriangle } from "lucide-react";
import { availableApiServices, isApiConnected } from "@/lib/api";
import { APIConnectionDialog } from "@/components/Dashboard/APIConnectionDialog";
import { InviteCodeManager } from "@/components/Dashboard/InviteCodeManager";

export default function Settings() {
  const [apiStatus, setApiStatus] = useState("disconnected");
  const [activeConnections, setActiveConnections] = useState<Record<string, boolean>>({});
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  
  useEffect(() => {
    const connections: Record<string, boolean> = {};
    availableApiServices.forEach(service => {
      connections[service.id] = isApiConnected(service.id);
    });
    setActiveConnections(connections);
  }, [apiDialogOpen]);
  
  return (
    <Layout>
      <div className="container py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>
        
        <Tabs defaultValue="account">
          <TabsList className="mb-4">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" />
              API
            </TabsTrigger>
            <TabsTrigger value="invites">
              <Key className="h-4 w-4 mr-2" />
              Invite Codes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details and preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john.doe@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" defaultValue="Client Success Manager" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" defaultValue="Acme, Inc." />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your interface and time zone settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Adjust the appearance of the app.</p>
                      </div>
                      <Switch id="darkMode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoRefresh">Auto-refresh Dashboard</Label>
                        <p className="text-sm text-muted-foreground">Refresh data every 5 minutes.</p>
                      </div>
                      <Switch id="autoRefresh" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <select id="timezone" className="w-full p-2 border rounded-md">
                        <option value="ET">Eastern Time (ET)</option>
                        <option value="CT">Central Time (CT)</option>
                        <option value="MT">Mountain Time (MT)</option>
                        <option value="PT">Pacific Time (PT)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how and when you want to be notified.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive daily summary and alerts.</p>
                    </div>
                    <Switch id="emailNotifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="browserNotifications">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get real-time alerts in your browser.</p>
                    </div>
                    <Switch id="browserNotifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="clientChanges">Client Changes</Label>
                      <p className="text-sm text-muted-foreground">Notify when client information is updated.</p>
                    </div>
                    <Switch id="clientChanges" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paymentAlerts">Payment Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about payment activities.</p>
                    </div>
                    <Switch id="paymentAlerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly summary of activities.</p>
                    </div>
                    <Switch id="weeklyDigest" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password and secure your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <div className="flex justify-end">
                      <Button>Update Password</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Secure your account with an additional verification step.</p>
                      </div>
                      <Switch id="twoFactor" />
                    </div>
                    <Button variant="outline">Set Up Two-Factor Authentication</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>Manage your active sessions and sign out remotely.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">Windows 11 • Chrome • San Francisco, USA</p>
                        </div>
                        <Badge>Active Now</Badge>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mobile App</p>
                          <p className="text-sm text-muted-foreground">iOS 16 • San Francisco, USA</p>
                        </div>
                        <Badge variant="outline">3 days ago</Badge>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Laptop</p>
                          <p className="text-sm text-muted-foreground">macOS • Firefox • New York, USA</p>
                        </div>
                        <Badge variant="outline">1 week ago</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Sign Out All Other Sessions</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  API Integration
                </CardTitle>
                <CardDescription>Connect and manage external service APIs.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {availableApiServices.map((service) => (
                    <div key={service.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Globe className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                        <Badge variant={activeConnections[service.id] ? "default" : "outline"} className={activeConnections[service.id] ? "bg-green-500" : ""}>
                          {activeConnections[service.id] ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                      <Button
                        className={`w-full ${activeConnections[service.id] ? "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200" : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"}`}
                        variant="outline"
                        onClick={() => {
                          if (activeConnections[service.id]) {
                            const connections = {...activeConnections};
                            connections[service.id] = false;
                            setActiveConnections(connections);
                            
                            const apiSettings = JSON.parse(localStorage.getItem('apiSettings') || '{}');
                            if (apiSettings[service.id]) {
                              apiSettings[service.id].connected = false;
                              localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
                            }
                          } else {
                            setApiDialogOpen(true);
                          }
                        }}
                      >
                        {activeConnections[service.id] ? (
                          <>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Disconnect
                          </>
                        ) : (
                          <>
                            <Link className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                  
                  <div className="mt-6">
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh API Connections
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <APIConnectionDialog
              open={apiDialogOpen}
              onOpenChange={setApiDialogOpen}
            />
          </TabsContent>
          
          <TabsContent value="invites" className="space-y-6">
            <InviteCodeManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
