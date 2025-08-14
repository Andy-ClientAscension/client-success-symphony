
import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useKanbanStore } from "@/utils/kanbanStore";
import { FormSubmissionData } from "@/types/common";

interface BackEndSalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormSubmissionData) => void;
  teams: string[];
}

interface BackEndSaleFormValues {
  studentId: string;
  studentName: string;
  status: "renewed" | "churned";
  renewalDate: Date;
  team: string;
  notes: string;
}

export function BackEndSalesForm({ isOpen, onClose, onSubmit, teams }: BackEndSalesFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { data } = useKanbanStore();
  const students = Object.values(data.students || {});

  const form = useForm<BackEndSaleFormValues>({
    defaultValues: {
      studentName: "",
      studentId: "",
      status: "renewed",
      renewalDate: new Date(),
      team: teams[0] || "",
      notes: ""
    }
  });

  const handleStudentSelect = (studentId: string) => {
    const selectedStudent = students.find(student => student.id === studentId);
    if (selectedStudent) {
      form.setValue("studentName", selectedStudent.name);
      form.setValue("team", selectedStudent.csm || teams[0] || "");
    }
  };

  const handleFormSubmit = (data: BackEndSaleFormValues) => {
    if (!data.studentId) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive"
      });
      return;
    }

    // Map student data to client data format expected by the backend sales tracker
    const formData = {
      clientId: data.studentId,
      clientName: data.studentName,
      status: data.status,
      renewalDate: date || new Date(),
      team: data.team,
      notes: data.notes,
      // Add empty painPoints array for churned clients
      painPoints: data.status === "churned" ? [] : []
    };

    onSubmit(formData);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Student to Backend Sales</DialogTitle>
          <DialogDescription>
            Add a student to the Back End Sales Tracker.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleStudentSelect(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="renewed">Renewed</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="renewalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Renewal Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team === "Team-Andy" ? "Team Andy" : 
                          team === "Team-Chris" ? "Team Chris" : 
                          team === "Team-Alex" ? "Team Alex" : 
                          team === "Team-Cillin" ? "Team Cillin" :
                          team === "Enterprise" ? "Enterprise" :
                          team === "SMB" ? "SMB" :
                          team === "Mid-Market" ? "Mid Market" : team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="Add notes (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Student</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
