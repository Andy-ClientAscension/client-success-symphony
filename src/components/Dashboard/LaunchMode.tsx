
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Users, 
  BarChart4,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { PreLaunchChecklist } from './PreLaunchChecklist';
import { PublishingChecklist } from './PublishingChecklist';

export function LaunchMode() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('checklist');
  const [launchState, setLaunchState] = useState<'pre-launch' | 'launch-ready' | 'launched'>('pre-launch');
  
  const handleLaunch = () => {
    setLaunchState('launched');
    toast({
      title: "Dashboard Launched!",
      description: "Your dashboard is now live and ready for users.",
      duration: 5000,
    });
  };
  
  const launchSteps = [
    { id: 'checklist', label: 'Checklists', icon: FileCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart4 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'User Access', icon: Users },
    { id: 'launch', label: 'Launch', icon: Rocket },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl">
          <Rocket className="mr-2 h-5 w-5 text-primary" />
          Launch Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Launch Progress</span>
            <span className="text-sm font-medium">
              {launchState === 'pre-launch' ? '60%' : 
                launchState === 'launch-ready' ? '90%' : '100%'}
            </span>
          </div>
          <Progress value={launchState === 'pre-launch' ? 60 : launchState === 'launch-ready' ? 90 : 100} className="h-2" />
          
          <div className="mt-3 p-3 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <div className="flex items-center">
              {launchState === 'launched' ? (
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <span>
                {launchState === 'pre-launch' 
                  ? 'Complete all checklists before launching your dashboard.' 
                  : launchState === 'launch-ready'
                  ? 'Your dashboard is ready to launch!'
                  : 'Your dashboard is live and accessible to users.'}
              </span>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            {launchSteps.map(step => (
              <TabsTrigger key={step.id} value={step.id} disabled={launchState === 'launched' && step.id !== 'launch'}>
                <step.icon className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">{step.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="checklist" className="space-y-4">
            <PreLaunchChecklist />
            <PublishingChecklist />
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => setLaunchState('launch-ready')}>
                Mark as Complete
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Configure analytics to track dashboard usage after launch.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 border rounded-md">
                    <div className="w-5 h-5 rounded-full bg-green-500 mr-3 flex items-center justify-center text-white">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span>Page view tracking</span>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <div className="w-5 h-5 rounded-full bg-green-500 mr-3 flex items-center justify-center text-white">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span>User action logging</span>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <div className="w-5 h-5 rounded-full bg-amber-500 mr-3"></div>
                    <span>Error monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Review security settings before launch.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 border rounded-md">
                    <div className="w-5 h-5 rounded-full bg-green-500 mr-3 flex items-center justify-center text-white">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span>Data storage security</span>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <div className="w-5 h-5 rounded-full bg-green-500 mr-3 flex items-center justify-center text-white">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span>Privacy policy implemented</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Configure who can access your dashboard.</p>
                
                <div className="border p-4 rounded-md mb-4">
                  <h3 className="font-medium mb-2">Current Access Mode</h3>
                  <p className="text-sm">Local-only mode: Dashboard data is stored locally on each user's device.</p>
                </div>
                
                <Button variant="outline" className="w-full">
                  Configure User Access
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="launch">
            <Card>
              <CardHeader>
                <CardTitle>Launch Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {launchState === 'launched' ? (
                    <div className="p-4 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-6 w-6 mr-3" />
                        <div>
                          <h3 className="font-bold">Dashboard Successfully Launched!</h3>
                          <p className="mt-1">Your dashboard is now live and accessible to users.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Before You Launch</h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure all required checklist items are complete and you've reviewed all settings.
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        disabled={launchState !== 'launch-ready'}
                        onClick={handleLaunch}
                      >
                        <Rocket className="mr-2 h-4 w-4" />
                        Launch Dashboard
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
