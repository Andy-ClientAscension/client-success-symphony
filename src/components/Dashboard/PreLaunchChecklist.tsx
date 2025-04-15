
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  required: boolean;
}

export function PreLaunchChecklist() {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "data-backup",
      label: "Create data backup",
      description: "Create a backup of all your dashboard data",
      checked: false,
      required: true
    },
    {
      id: "feature-testing",
      label: "Test all features",
      description: "Verify all features work correctly across devices",
      checked: false,
      required: true
    },
    {
      id: "mobile-responsive",
      label: "Mobile responsiveness",
      description: "Confirm the dashboard works well on mobile devices",
      checked: false,
      required: true
    },
    {
      id: "analytics-setup",
      label: "Set up analytics",
      description: "Implement usage analytics to track user engagement",
      checked: false,
      required: false
    },
    {
      id: "documentation",
      label: "Documentation",
      description: "Ensure help content is complete and easy to understand",
      checked: false,
      required: true
    },
    {
      id: "data-privacy",
      label: "Privacy policy",
      description: "Add privacy policy informing users about data storage",
      checked: false,
      required: true
    }
  ]);

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

  const handleLaunch = () => {
    toast({
      title: "Dashboard Launched",
      description: "Your dashboard has been successfully launched!",
      duration: 5000,
    });
  };

  const allRequiredChecked = checklist.filter(item => item.required).every(item => item.checked);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
          Pre-Launch Checklist
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
        
        <div className="space-y-3">
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
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-5">
          <div className={`p-3 rounded-md ${allRequiredChecked ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'} mb-4`}>
            <div className="flex items-center">
              {allRequiredChecked ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">
                {allRequiredChecked ? 
                  "All required items are complete!" : 
                  "Complete all required items before launching"
                }
              </span>
            </div>
          </div>
          
          <Button 
            disabled={!allRequiredChecked} 
            className="w-full" 
            onClick={handleLaunch}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Launch Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
