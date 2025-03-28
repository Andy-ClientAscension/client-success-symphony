
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// CSM Team data
const CSM_TEAMS = [
  { id: "team1", name: "Team Alpha" },
  { id: "team2", name: "Team Beta" },
  { id: "team3", name: "Team Gamma" },
  { id: "team4", name: "Team Delta" },
];

interface StudentDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, csm?: string) => void;
  title: string;
  defaultDate?: Date;
  showCsmSelect?: boolean;
  defaultCsm?: string;
}

export function StudentDateModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  defaultDate = new Date(),
  showCsmSelect = false,
  defaultCsm,
}: StudentDateModalProps) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [csm, setCsm] = useState<string | undefined>(defaultCsm);

  const handleConfirm = () => {
    if (date) {
      onConfirm(date, csm);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
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
          </div>
          
          {showCsmSelect && (
            <div className="grid gap-2">
              <Label htmlFor="csm">CSM Team</Label>
              <Select value={csm} onValueChange={setCsm}>
                <SelectTrigger id="csm" className="w-full">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select CSM Team" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {CSM_TEAMS.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
