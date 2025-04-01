
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StudentDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  title: string;
  defaultDate: Date;
  showReasonField?: boolean;
  reason?: string;
  onReasonChange?: (reason: string) => void;
}

export function StudentDateModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  defaultDate,
  showReasonField = false,
  reason = "",
  onReasonChange
}: StudentDateModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate);
  
  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(selectedDate);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
          />
          
          {showReasonField && (
            <div className="mt-4">
              <Label htmlFor="pause-reason">Reason for pause</Label>
              <Textarea
                id="pause-reason"
                placeholder="Enter reason for pause"
                value={reason}
                onChange={(e) => onReasonChange && onReasonChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedDate || (showReasonField && !reason)}>
            Confirm {selectedDate && format(selectedDate, "MMM d, yyyy")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
