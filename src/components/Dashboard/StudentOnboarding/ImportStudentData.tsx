import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileUp, AlertCircle, FileCheck, Copy, ExternalLink } from "lucide-react";
import { saveAnalyticsData, STORAGE_KEYS, saveData } from "@/utils/persistence";
import { Client } from "@/lib/data";

type ImportFormat = "csv" | "json" | "google-form";

interface ImportedStudent {
  name: string;
  email: string;
  status?: string;
  team?: string;
  service?: string;
  phone?: string;
  startDate?: string;
  contractValue?: string | number;
  csm?: string;
  contract_type?: string;
  contract_duration_months?: string | number;
}

export function ImportStudentData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<ImportFormat>("csv");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [googleFormData, setGoogleFormData] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const googleFormTemplate = `Name,Email,Phone,Service,Team,Start Date
John Doe,john@example.com,(555) 123-4567,Backend Development,Team A,2024-01-15
Jane Smith,jane@example.com,(555) 987-6543,Full Stack,Team B,2024-01-20`;

  const copyTemplate = () => {
    navigator.clipboard.writeText(googleFormTemplate);
    toast({
      title: "Template Copied",
      description: "CSV template has been copied to your clipboard",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(true);
      setFileName(file.name);
      setError(null);
      setSuccess(false);
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (format === 'csv' && extension !== 'csv') {
        setError("Please select a CSV file.");
        return;
      } else if (format === 'json' && extension !== 'json') {
        setError("Please select a JSON file.");
        return;
      }
    } else {
      setFileSelected(false);
      setFileName("");
      setSuccess(false);
    }
  };

  const parseCSV = (text: string): ImportedStudent[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error("CSV must have headers and at least one data row");
    
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const results: ImportedStudent[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim());
      if (values.length !== headers.length) continue;
      
      const student: any = {};
      headers.forEach((header, index) => {
        student[header] = values[index];
      });
      
      // Map common variations
      const mapped: ImportedStudent = {
        name: student.name || student['full name'] || student['student name'],
        email: student.email || student['email address'],
        phone: student.phone || student['phone number'],
        service: student.service || student.program || student.course,
        team: student.team || student.cohort || 'Default',
        startDate: student['start date'] || student.startdate || new Date().toISOString().split('T')[0],
        contractValue: student['contract value'] || student.price || 10000,
        csm: student.csm || student.manager || 'Unassigned',
        contract_type: student['contract type'] || student.contract_type || student.contract,
        contract_duration_months: student['contract duration'] || student.contract_duration_months || student.duration
      };
      
      if (mapped.name && mapped.email) {
        results.push(mapped);
      }
    }
    
    return results;
  };

  const parseJSON = (text: string): ImportedStudent[] => {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      throw new Error("JSON data must be an array of student objects");
    }
    return data;
  };

  const validateStudent = (student: ImportedStudent): Client => {
    const contractValue = typeof student.contractValue === 'string' 
      ? parseInt(student.contractValue.replace(/[^\d]/g, ''), 10) || 10000
      : student.contractValue || 10000;

    const contractDurationMonths = typeof student.contract_duration_months === 'string'
      ? parseInt(student.contract_duration_months, 10)
      : student.contract_duration_months;

    return {
      id: `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      status: 'new' as any,
      progress: 0,
      startDate: student.startDate || new Date().toISOString().split('T')[0],
      endDate: (() => {
        const start = new Date(student.startDate || new Date());
        const months = contractDurationMonths || 6; // Default to 6 months
        start.setMonth(start.getMonth() + months);
        return start.toISOString().split('T')[0];
      })(),
      contractValue,
      service: student.service || 'General Program',
      team: student.team || 'Default',
      csm: student.csm || 'Unassigned',
      contract_type: student.contract_type,
      contract_duration_months: contractDurationMonths,
      callsBooked: 0,
      dealsClosed: 0,
      mrr: 0,
      npsScore: null,
      health_score: 80 // Default health score for new students
    };
  };

  const updateDashboardData = (students: Client[]) => {
    try {
      const existingClientsStr = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      let existingClients: Record<string, Client> = {};
      
      if (existingClientsStr) {
        try {
          existingClients = JSON.parse(existingClientsStr);
        } catch (e) {
          console.error("Failed to parse existing clients data:", e);
        }
      }
      
      const updatedClients = { ...existingClients };
      students.forEach(student => {
        updatedClients[student.id] = student;
      });
      
      saveData(STORAGE_KEYS.CLIENTS, updatedClients);
      saveAnalyticsData(updatedClients);
      
      return students.length;
    } catch (error) {
      console.error("Error updating dashboard data:", error);
      throw new Error("Failed to update dashboard data");
    }
  };

  const handleImport = async () => {
    if (format === 'google-form') {
      if (!googleFormData.trim()) {
        setError("Please paste your Google Form data.");
        return;
      }
      
      setIsLoading(true);
      try {
        const importedStudents = parseCSV(googleFormData);
        const validatedStudents = importedStudents.map(validateStudent);
        const count = updateDashboardData(validatedStudents);
        
        setImportedCount(count);
        setSuccess(true);
        toast({
          title: "Students Added Successfully",
          description: `Successfully imported ${count} students.`,
        });
      } catch (err: any) {
        setError(err.message || "Failed to import student data.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      let importedStudents: ImportedStudent[] = [];
      
      if (format === 'csv') {
        importedStudents = parseCSV(text);
      } else if (format === 'json') {
        importedStudents = parseJSON(text);
      }
      
      if (importedStudents.length === 0) {
        throw new Error("No valid student data found in the file.");
      }
      
      const validatedStudents = importedStudents.map(validateStudent);
      const count = updateDashboardData(validatedStudents);
      
      setImportedCount(count);
      setSuccess(true);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${count} students from ${fileName}.`,
      });
      
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message || "Failed to import data. Please check your file format and try again.");
      
      toast({
        title: "Import Failed",
        description: err.message || "Failed to import data. Please check file format.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Import Students</DialogTitle>
        <DialogDescription>
          Add new students to your dashboard from various sources
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Import Method</Label>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant={format === "google-form" ? "default" : "outline"}
              onClick={() => setFormat("google-form")}
              size="sm"
            >
              Google Form
            </Button>
            <Button 
              type="button" 
              variant={format === "csv" ? "default" : "outline"}
              onClick={() => setFormat("csv")}
              size="sm"
            >
              CSV File
            </Button>
            <Button 
              type="button" 
              variant={format === "json" ? "default" : "outline"}
              onClick={() => setFormat("json")}
              size="sm"
            >
              JSON File
            </Button>
          </div>
        </div>

        {format === 'google-form' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Google Form Integration</h4>
              <p className="text-sm text-muted-foreground mb-3">
                1. Export responses from your Google Form as CSV
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                2. Copy the CSV data and paste it below
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyTemplate}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://forms.google.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Forms
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="google-form-data">Paste CSV Data</Label>
              <Textarea
                id="google-form-data"
                placeholder="Paste your Google Form CSV data here..."
                value={googleFormData}
                onChange={(e) => setGoogleFormData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={format === "csv" ? ".csv" : ".json"}
            />
            {fileName && (
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <FileUp className="h-3 w-3 mr-1" /> {fileName}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 p-3 rounded-md flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 p-3 rounded-md flex items-start">
            <FileCheck className="h-4 w-4 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Import Successful!</p>
              <p className="text-xs">{importedCount} students added to your dashboard.</p>
            </div>
          </div>
        )}

        <div className="bg-muted p-3 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Required Fields</p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1 space-y-1">
                <li>Name - Student's full name</li>
                <li>Email - Contact email address</li>
                <li>Optional: Phone, Service/Program, Team, Start Date</li>
                <li>All new students start with "new" status and 80 health score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <DialogClose asChild>
          <Button type="button" variant="outline" size="sm">
            Cancel
          </Button>
        </DialogClose>
        <Button 
          type="button" 
          onClick={handleImport}
          disabled={isLoading || (format !== 'google-form' && !fileSelected) || (format === 'google-form' && !googleFormData.trim())}
          size="sm"
        >
          {isLoading ? "Importing..." : "Import Students"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}