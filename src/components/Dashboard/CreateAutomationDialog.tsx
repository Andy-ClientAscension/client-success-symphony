
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define the automation schema
const automationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  triggerType: z.string().default("webhook"),
  webhookUrl: z.string().optional(),
});

type AutomationFormValues = z.infer<typeof automationSchema>;

// Define the props for the component
interface CreateAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAutomationCreated?: (automation: AutomationFormValues) => void;
}

export function CreateAutomationDialog({
  open,
  onOpenChange,
  onAutomationCreated,
}: CreateAutomationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Initialize the form
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: "",
      description: "",
      triggerType: "webhook",
      webhookUrl: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: AutomationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call/saving to storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for persistence
      const existingAutomations = JSON.parse(localStorage.getItem("automations") || "[]");
      const newAutomation = {
        ...values,
        id: `automation-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      
      localStorage.setItem("automations", JSON.stringify([...existingAutomations, newAutomation]));
      
      // Show success message
      toast({
        title: "Automation Created",
        description: `${values.name} has been successfully created.`,
      });
      
      // Call the onAutomationCreated callback if provided
      if (onAutomationCreated) {
        onAutomationCreated(values);
      }
      
      // Close the dialog
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create automation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Automation</DialogTitle>
          <DialogDescription>
            Create a new automation workflow to connect your client dashboard with external services and automate tasks.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Automation Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., New Client Onboarding" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your automation a descriptive name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="What does this automation do?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://hooks.zapier.com/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    If you have a webhook URL from Zapier or Make, enter it here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Automation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
