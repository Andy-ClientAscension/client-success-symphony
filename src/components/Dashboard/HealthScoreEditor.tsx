
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
  updatesInteractions: z.string().min(1, { message: "Updates/interactions are required" }),
  wins: z.string().optional(),
  struggles: z.string().optional(),
  outreachChannels: z.string().optional(),
  bookedCalls: z.coerce.number().min(0).default(0),
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
    updatesInteractions?: string;
    wins?: string;
    struggles?: string;
    outreachChannels?: string;
    bookedCalls?: number;
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
      updatesInteractions: initialData?.updatesInteractions || "",
      wins: initialData?.wins || "",
      struggles: initialData?.struggles || "",
      outreachChannels: initialData?.outreachChannels || "",
      bookedCalls: initialData?.bookedCalls || 0,
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
      updatesInteractions: data.updatesInteractions,
      wins: data.wins || "",
      struggles: data.struggles || "",
      outreachChannels: data.outreachChannels || "",
      bookedCalls: data.bookedCalls,
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

  const getScoreButtonColor = (value: number, currentValue: number) => {
    if (value !== currentValue) return "";
    
    if (value >= 8) return "bg-green-600 hover:bg-green-700";
    if (value >= 5) return "bg-amber-500 hover:bg-amber-600";
    return "bg-red-600 hover:bg-red-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Update" : "Add"} Health Score for {clientName}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="updatesInteractions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Updates/Interactions *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Recent communications, meetings, etc."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wins</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Recent successes"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="struggles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Struggles</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Current challenges"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="outreachChannels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outreach Channels</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Email, LinkedIn, etc."
                        className="min-h-[60px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bookedCalls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booked Calls</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="Number of booked calls" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Score (1-10)</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <Button 
                          key={value}
                          type="button"
                          variant={field.value === value ? "default" : "outline"} 
                          className={`w-9 h-9 p-0 ${getScoreButtonColor(value, field.value)}`}
                          onClick={() => field.onChange(value)}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
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
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes or observations..."
                      className="min-h-[80px]"
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
