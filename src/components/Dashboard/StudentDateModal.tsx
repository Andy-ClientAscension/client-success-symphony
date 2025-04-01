
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
import { useToast } from "@/hooks/use-toast";

interface StudentDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, reason?: string) => void;
  title: string;
  defaultDate: Date;
  showReasonField?: boolean;
  reason?: string;
  onReasonChange?: (reason: string) => void;
  isPauseModal?: boolean;
}

export function StudentDateModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  defaultDate,
  showReasonField = false,
  reason = "",
  onReasonChange,
  isPauseModal = false
}: StudentDateModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate);
  const [pauseReason, setPauseReason] = useState<string>(reason);
  const { toast } = useToast();
  
  const handleConfirm = () => {
    if (selectedDate) {
      try {
        onConfirm(selectedDate, showReasonField ? pauseReason : undefined);
        onClose();
        
        if (isPauseModal && pauseReason) {
          toast({
            title: "Student Paused",
            description: `Student has been paused until ${format(selectedDate, "MMM d, yyyy")}.`,
          });
        }
      } catch (error) {
        console.error("Error in StudentDateModal handleConfirm:", error);
        toast({
          title: "Error",
          description: "There was an error processing your request.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPauseReason(e.target.value);
    if (onReasonChange) {
      onReasonChange(e.target.value);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
              <Label htmlFor="pause-reason">Reason for {isPauseModal ? "pause" : "leaving"}</Label>
              <Textarea
                id="pause-reason"
                placeholder={`Enter reason for ${isPauseModal ? "pause" : "leaving"}`}
                value={pauseReason}
                onChange={handleReasonChange}
                className="mt-1"
                rows={3}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedDate || (showReasonField && !pauseReason)}
            className="bg-red-600 hover:bg-red-700"
          >
            Confirm {selectedDate && format(selectedDate, "MMM d, yyyy")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
