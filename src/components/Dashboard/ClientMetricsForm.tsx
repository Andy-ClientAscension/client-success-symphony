
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, BarChart2, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  callsBooked: z.coerce.number().min(0, {
    message: "Calls booked cannot be negative.",
  }),
  dealsClosed: z.coerce.number().min(0, {
    message: "Deals closed cannot be negative.",
  }),
  mrr: z.coerce.number().min(0, {
    message: "MRR cannot be negative.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientMetricsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  clientName: string;
  initialData: {
    callsBooked: number;
    dealsClosed: number;
    mrr: number;
  };
}

export function ClientMetricsForm({
  isOpen,
  onClose,
  onSubmit,
  clientName,
  initialData,
}: ClientMetricsFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      callsBooked: initialData.callsBooked,
      dealsClosed: initialData.dealsClosed,
      mrr: initialData.mrr,
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    toast({
      title: "Metrics Updated",
      description: `${clientName}'s metrics have been updated successfully.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Metrics for {clientName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="callsBooked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      <span>Calls Booked</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dealsClosed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-red-600" />
                      <span>Deals Closed</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mrr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      <span>Monthly Recurring Revenue ($)</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                Update Metrics
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
