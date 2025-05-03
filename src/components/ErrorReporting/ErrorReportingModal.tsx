
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bug } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { errorService } from "@/utils/error";

interface ErrorReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: Error | null;
  context?: string;
  additionalInfo?: Record<string, any>;
}

export function ErrorReportingModal({
  isOpen,
  onClose,
  error,
  context = "general",
  additionalInfo = {}
}: ErrorReportingModalProps) {
  const [userFeedback, setUserFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Capture the error with additional context and user feedback
      errorService.captureError(error || new Error("Unknown error"), {
        severity: "high",
        context: {
          userFeedback,
          userEmail: email,
          location: context,
          ...additionalInfo
        }
      });
      
      // Show success message
      toast({
        title: "Error Report Submitted",
        description: "Thank you for your feedback. We'll look into this issue.",
        variant: "default",
      });
      
      // Close the modal
      onClose();
    } catch (err) {
      toast({
        title: "Failed to Submit Report",
        description: "Please try again or contact support directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bug className="h-5 w-5 mr-2" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Help us improve by describing what happened when you encountered this error.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="error-details">Error Details</Label>
            <div className="p-2 bg-muted rounded-md text-sm overflow-auto max-h-24">
              {error?.message || "Unknown error"}
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="feedback">Please describe what you were doing when the error occurred</Label>
            <Textarea
              id="feedback"
              placeholder="E.g., I was trying to view student data when..."
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
              className="min-h-20"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We'll only use this to follow up about this specific issue
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
