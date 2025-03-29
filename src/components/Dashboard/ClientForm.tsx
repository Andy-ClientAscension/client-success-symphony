
import { useState } from "react";
import { format, addMonths, addYears } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  contractDuration: z.enum(["6months", "1year"], {
    required_error: "Please select a contract duration.",
  }),
  status: z.enum(["new", "active", "at-risk", "churned"], {
    required_error: "Please select a status.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  onSubmit: (data: FormValues & { endDate: Date }) => void;
  onCancel: () => void;
}

export function ClientForm({ onSubmit, onCancel }: ClientFormProps) {
  const { toast } = useToast();
  const [endDate, setEndDate] = useState<Date | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "new",
      contractDuration: "6months",
      startDate: new Date(),
    },
  });

  const watchStartDate = form.watch("startDate");
  const watchContractDuration = form.watch("contractDuration");

  // Calculate the end date based on the contract duration and start date
  const calculateEndDate = (startDate: Date, duration: string): Date => {
    if (duration === "6months") {
      return addMonths(startDate, 6);
    } else {
      return addYears(startDate, 1);
    }
  };

  // Update end date when start date or contract duration changes
  useState(() => {
    if (watchStartDate && watchContractDuration) {
      const calculatedEndDate = calculateEndDate(watchStartDate, watchContractDuration);
      setEndDate(calculatedEndDate);
    }
  });

  const handleFormSubmit = (data: FormValues) => {
    if (!endDate) return;

    onSubmit({
      ...data,
      endDate: endDate,
    });

    toast({
      title: "Client created",
      description: `${data.name} has been added with a contract ending on ${format(endDate, "PPP")}`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter client name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      if (date && form.getValues("contractDuration")) {
                        const newEndDate = calculateEndDate(
                          date,
                          form.getValues("contractDuration")
                        );
                        setEndDate(newEndDate);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The date when the client's contract begins.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contractDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Duration</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (form.getValues("startDate")) {
                    const newEndDate = calculateEndDate(
                      form.getValues("startDate"),
                      value
                    );
                    setEndDate(newEndDate);
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display calculated end date */}
        <div className="border border-red-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="font-medium truncate">Calculated End Date</span>
          </div>
          <p className="text-lg font-medium">
            {endDate ? format(endDate, "PPP") : "Select start date and duration"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This date is automatically calculated based on the start date and contract duration.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            Add Client
          </Button>
        </div>
      </form>
    </Form>
  );
}
