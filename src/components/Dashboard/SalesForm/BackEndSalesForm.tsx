
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
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useKanbanStore } from "@/utils/kanbanStore";
import { FormFields } from "./FormFields";

interface BackEndSalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  teams: string[];
  editData?: {
    id: string;
    clientId: string;
    clientName: string;
    status: "renewed" | "churned";
    renewalDate: Date | string;
    team?: string;
    notes: string;
    painPoints: string[];
  } | null;
}

interface BackEndSaleFormValues {
  studentId: string;
  studentName: string;
  status: "renewed" | "churned";
  renewalDate: Date;
  team: string;
  notes: string;
  painPoints: string;
}

export function BackEndSalesForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  teams, 
  editData = null 
}: BackEndSalesFormProps) {
  // Initialize date with editData date if in edit mode
  const initialDate = editData?.renewalDate 
    ? new Date(editData.renewalDate) 
    : new Date();
  
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const { toast } = useToast();
  const { data } = useKanbanStore();
  const students = Object.values(data.students || {});
  const isEditMode = !!editData;

  // Set up form with initial values based on edit mode
  const defaultValues = isEditMode 
    ? {
        studentId: editData.clientId,
        studentName: editData.clientName,
        status: editData.status,
        renewalDate: new Date(editData.renewalDate),
        team: editData.team || teams[0] || "",
        notes: editData.notes,
        painPoints: editData.painPoints.join(", ")
      }
    : {
        studentId: "",
        studentName: "",
        status: "renewed",
        renewalDate: new Date(),
        team: teams[0] || "",
        notes: "",
        painPoints: ""
      };

  const form = useForm<BackEndSaleFormValues>({
    defaultValues
  });

  const handleStudentSelect = (studentId: string) => {
    if (isEditMode) return; // Don't update fields when editing
    
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

    // Map form data to the structure expected by the backend sales tracker
    const formData = {
      id: editData?.id || `bsale-${Date.now()}`, // Keep original ID if editing
      clientId: data.studentId,
      clientName: data.studentName,
      status: data.status,
      renewalDate: date || new Date(),
      team: data.team,
      notes: data.notes,
      // Parse comma-separated pain points if status is churned
      painPoints: data.status === "churned" && data.painPoints 
        ? data.painPoints.split(',').map(point => point.trim()).filter(Boolean)
        : []
    };

    onSubmit(formData);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Backend Sales Entry" : "Add Student to Backend Sales"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update information for this student in the Back End Sales Tracker."
              : "Add a student to the Back End Sales Tracker."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormFields 
              form={form}
              date={date}
              setDate={setDate}
              students={students}
              teams={teams}
              handleStudentSelect={handleStudentSelect}
              onClose={onClose}
              isEditMode={isEditMode}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
