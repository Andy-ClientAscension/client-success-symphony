
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveHealthScore } from "@/utils/persistence";

const formSchema = z.object({
  score: z.coerce
    .number()
    .min(1, { message: "Score must be at least 1" })
    .max(10, { message: "Score cannot exceed 10" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface HealthScoreEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  clientId: string;
  clientName: string;
  team: string;
  csm: string;
  initialData?: {
    id?: string;
    score?: number;
    notes?: string;
  };
}

export function HealthScoreEditor({
  isOpen,
  onClose,
  onSubmit,
  clientId,
  clientName,
  team,
  csm,
  initialData,
}: HealthScoreEditorProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: initialData?.score || 5,
      notes: initialData?.notes || "",
    },
  });

  const handleSubmit = (data: FormValues) => {
    // Create a unique ID if this is a new score
    const id = initialData?.id || `health-${clientId}-${Date.now()}`;
    
    saveHealthScore({
      id,
      clientId,
      clientName,
      team,
      csm,
      score: data.score,
      notes: data.notes || "",
      date: new Date().toISOString(),
    });
    
    toast({
      title: "Health Score Updated",
      description: `${clientName}'s health score has been set to ${data.score}/10`,
    });
    
    onSubmit();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Update" : "Add"} Health Score for {clientName}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Score (1-10)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={10}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add context about this health score..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {initialData?.id ? "Update" : "Save"} Health Score
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
