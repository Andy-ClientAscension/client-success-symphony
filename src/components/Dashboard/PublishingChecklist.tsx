
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, FileCheck, ShieldCheck, Database, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createBackup } from "@/utils/persistence";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  required: boolean;
  action?: () => void;
  actionLabel?: string;
}

export function PublishingChecklist() {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "data-backup",
      label: "Create data backup",
      description: "Create a backup of all your dashboard data before publishing",
      checked: false,
      required: true,
      action: () => handleCreateBackup(),
      actionLabel: "Create Backup"
    },
    {
      id: "test-features",
      label: "Test all features",
      description: "Ensure all dashboard features are working correctly",
      checked: false,
      required: true
    },
    {
      id: "mobile-responsive",
      label: "Mobile responsiveness",
      description: "Check that the dashboard works well on mobile devices",
      checked: false,
      required: true
    },
    {
      id: "error-handling",
      label: "Error handling",
      description: "Verify proper error handling throughout the application",
      checked: false,
      required: true
    },
    {
      id: "user-permissions",
      label: "User permissions",
      description: "Set up appropriate user roles and permissions",
      checked: false,
      required: false
    },
    {
      id: "analytics",
      label: "Analytics integration",
      description: "Set up analytics to track dashboard usage",
      checked: false,
      required: false
    }
  ]);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const backup = createBackup();
      
      // Create blob and download link
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Mark the item as checked
      setChecklist(prev => prev.map(item => 
        item.id === "data-backup" ? { ...item, checked: true } : item
      ));
      
      toast({
        title: "Backup created",
        description: "Your dashboard data has been backed up successfully",
      });
    } catch (error) {
      toast({
        title: "Backup failed",
        description: "There was an error creating your backup",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const getCompletionPercentage = () => {
    const requiredItems = checklist.filter(item => item.required);
    const checkedRequiredItems = requiredItems.filter(item => item.checked);
    return Math.round((checkedRequiredItems.length / requiredItems.length) * 100);
  };

  const allRequiredChecked = checklist.filter(item => item.required).every(item => item.checked);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <FileCheck className="mr-2 h-5 w-5 text-primary" />
          Publishing Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Completion</span>
            <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </div>
        
        <div className="space-y-4">
          {checklist.map(item => (
            <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-secondary/20 transition-colors">
              <Checkbox 
                id={item.id} 
                checked={item.checked}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <div className="flex-1">
                <label 
                  htmlFor={item.id}
                  className="text-sm font-medium leading-none cursor-pointer flex items-center"
                >
                  {item.label}
                  {item.required && (
                    <span className="text-xs bg-amber-100 text-amber-800 ml-2 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </label>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                
                {item.action && item.actionLabel && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={item.action}
                    disabled={creating && item.id === "data-backup"}
                  >
                    {creating && item.id === "data-backup" ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      item.actionLabel
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex flex-col space-y-4">
          <div className={`p-3 rounded-md ${allRequiredChecked ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
            <div className="flex items-center">
              {allRequiredChecked ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">
                {allRequiredChecked ? 
                  "All required items are complete!" : 
                  "Complete all required items before publishing"
                }
              </span>
            </div>
          </div>
          
          <Button disabled={!allRequiredChecked} className="w-full">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Publish Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
