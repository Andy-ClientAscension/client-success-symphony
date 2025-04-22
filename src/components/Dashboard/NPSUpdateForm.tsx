
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateClientNPSScore } from "@/lib/data";

const formSchema = z.object({
  npsScore: z.coerce.number().min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

interface NPSUpdateFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  currentScore: number | null;
  onSubmit?: (score: number) => void;  // Add this optional prop
}

export function NPSUpdateForm({
  isOpen,
  onClose,
  clientId,
  clientName,
  currentScore,
  onSubmit,  // Include in destructuring
}: NPSUpdateFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      npsScore: currentScore || 0,
    },
  });

  const handleSubmit = (data: FormValues) => {
    const success = updateClientNPSScore(clientId, data.npsScore);
    
    if (success) {
      toast({
        title: "NPS Score Updated",
        description: `${clientName}'s NPS score has been updated to ${data.npsScore}.`,
      });
      
      // Call the onSubmit prop if provided
      if (onSubmit) {
        onSubmit(data.npsScore);
      }
      
      onClose();
    } else {
      toast({
        title: "Error",
        description: "Failed to update NPS score. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-success-600";
    if (score >= 7) return "text-success-500";
    if (score >= 4) return "text-warning-500";
    return "text-red-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update NPS Score for {clientName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="npsScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span>NPS Score (0-10)</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                      className="flex flex-wrap gap-2"
                    >
                      {Array.from({length: 11}, (_, i) => (
                        <div key={i} className="flex items-center space-x-1">
                          <RadioGroupItem value={i.toString()} id={`nps-${i}`} />
                          <label 
                            htmlFor={`nps-${i}`} 
                            className={`text-sm font-medium ${getScoreColor(i)}`}
                          >
                            {i}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-sm text-muted-foreground mt-2">
              <div>NPS Score Legend:</div>
              <div className="flex items-center mt-1">
                <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                <span>0-6: Detractors</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span>7-8: Passives</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>9-10: Promoters</span>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Update NPS
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
