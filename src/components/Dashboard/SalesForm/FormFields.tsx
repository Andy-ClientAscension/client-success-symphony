
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface StudentOption {
  id: string;
  name: string;
  csm?: string;
}

interface FormFieldsProps {
  form: any;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  students: StudentOption[];
  teams: string[];
  handleStudentSelect: (studentId: string) => void;
  onClose: () => void;
  isEditMode: boolean;
}

export function FormFields({ 
  form, 
  date, 
  setDate, 
  students, 
  teams, 
  handleStudentSelect, 
  onClose,
  isEditMode
}: FormFieldsProps) {
  return (
    <>
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
              disabled={isEditMode}
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
                    {formatTeamName(team)}
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
              <Textarea placeholder="Add notes (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("status") === "churned" && (
        <FormField
          control={form.control}
          name="painPoints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pain Points (comma separated)</FormLabel>
              <FormControl>
                <Textarea placeholder="Price too high, Not seeing value, etc..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditMode ? "Update Entry" : "Add Student"}
        </Button>
      </div>
    </>
  );
}

export function formatTeamName(team: string): string {
  if (team === "Team-Andy") return "Team Andy";
  if (team === "Team-Chris") return "Team Chris";
  if (team === "Team-Alex") return "Team Alex";
  if (team === "Team-Cillin") return "Team Cillin";
  if (team === "Enterprise") return "Enterprise";
  if (team === "SMB") return "SMB";
  if (team === "Mid-Market") return "Mid Market";
  return team;
}
