
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/LoadingState";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { FileUp, AlertCircle, FileCheck, Check } from "lucide-react";
import { saveAnalyticsData, STORAGE_KEYS, saveData } from "@/utils/persistence";
import { Client } from "@/lib/data";

type ImportFormat = "csv" | "json" | "xlsx";

interface ImportedClient {
  name: string;
  status: string;
  progress: string | number;
  endDate: string;
  csm?: string;
  callsBooked?: string | number;
  dealsClosed?: string | number;
  mrr?: string | number;
  npsScore?: string | number;
  startDate?: string;
  contractValue?: string | number;
}

export function ImportData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<ImportFormat>("csv");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(true);
      setFileName(file.name);
      setError(null);
      setSuccess(false);
      
      // Validate file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (format === 'csv' && extension !== 'csv') {
        setError("Please select a CSV file.");
        return;
      } else if (format === 'json' && extension !== 'json') {
        setError("Please select a JSON file.");
        return;
      } else if (format === 'xlsx' && !['xlsx', 'xls'].includes(extension || '')) {
        setError("Please select an Excel file.");
        return;
      }
    } else {
      setFileSelected(false);
      setFileName("");
      setSuccess(false);
    }
  };

  const parseCSV = (text: string): ImportedClient[] => {
    const lines = text.split('\n');
    // Extract headers from the first line
    const headers = lines[0].split(',').map(header => header.trim());
    
    const requiredFields = ['name', 'status', 'progress', 'endDate'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Process data rows
    const results: ImportedClient[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(val => val.trim());
      if (values.length !== headers.length) {
        console.warn(`Line ${i+1} has ${values.length} values, expected ${headers.length}. Skipping.`);
        continue;
      }
      
      const client: Record<string, any> = {};
      headers.forEach((header, index) => {
        client[header] = values[index];
      });
      
      results.push(client as ImportedClient);
    }
    
    return results;
  };
  
  const parseJSON = (text: string): ImportedClient[] => {
    const data = JSON.parse(text);
    
    if (!Array.isArray(data)) {
      throw new Error("JSON data must be an array of client objects");
    }
    
    // Validate each client has required fields
    const requiredFields = ['name', 'status', 'progress', 'endDate'];
    data.forEach((client, index) => {
      const missingFields = requiredFields.filter(field => !(field in client));
      if (missingFields.length > 0) {
        throw new Error(`Client at index ${index} is missing required fields: ${missingFields.join(', ')}`);
      }
    });
    
    return data;
  };
  
  const validateClient = (client: ImportedClient): Client => {
    // Convert string values to appropriate types
    const progress = typeof client.progress === 'string' 
      ? parseInt(client.progress, 10) 
      : client.progress;
    
    const callsBooked = client.callsBooked 
      ? (typeof client.callsBooked === 'string' 
        ? parseInt(client.callsBooked, 10) 
        : client.callsBooked) 
      : 0;
      
    const dealsClosed = client.dealsClosed 
      ? (typeof client.dealsClosed === 'string' 
        ? parseInt(client.dealsClosed, 10) 
        : client.dealsClosed) 
      : 0;
      
    const mrr = client.mrr 
      ? (typeof client.mrr === 'string' 
        ? parseInt(client.mrr, 10) 
        : client.mrr) 
      : 0;
      
    const npsScore = client.npsScore 
      ? (typeof client.npsScore === 'string' 
        ? parseInt(client.npsScore, 10) 
        : client.npsScore) 
      : null;
    
    const contractValue = client.contractValue
      ? (typeof client.contractValue === 'string'
        ? parseInt(client.contractValue, 10)
        : client.contractValue)
      : 10000; // Default contract value if not provided
    
    // Validate status
    const validStatuses = ['active', 'at-risk', 'churned', 'new', 'backend', 'olympia', 'paused', 'graduated'];
    const status = validStatuses.includes(client.status) 
      ? client.status 
      : 'active';
    
    // Set startDate to 6 months before endDate if not provided
    const endDate = client.endDate;
    const startDate = client.startDate || (() => {
      const end = new Date(endDate);
      const start = new Date(end);
      start.setMonth(start.getMonth() - 6);
      return start.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    })();
    
    return {
      id: `imported-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: client.name,
      status: status as any,
      progress: isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress)),
      startDate: startDate,
      endDate: client.endDate,
      contractValue: isNaN(contractValue) ? 10000 : contractValue,
      csm: client.csm || 'Unassigned',
      callsBooked: isNaN(callsBooked) ? 0 : callsBooked,
      dealsClosed: isNaN(dealsClosed) ? 0 : dealsClosed,
      mrr: isNaN(mrr) ? 0 : mrr,
      npsScore: npsScore === null || isNaN(npsScore as number) ? null : Math.min(10, Math.max(0, npsScore as number))
    };
  };
  
  const updateDashboardData = (clients: Client[]) => {
    try {
      // Get existing clients data
      const existingClientsStr = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      let existingClients: Record<string, Client> = {};
      
      if (existingClientsStr) {
        try {
          existingClients = JSON.parse(existingClientsStr);
        } catch (e) {
          console.error("Failed to parse existing clients data:", e);
        }
      }
      
      // Add new clients
      const updatedClients = { ...existingClients };
      
      clients.forEach(client => {
        updatedClients[client.id] = client;
      });
      
      // Save updated clients
      saveData(STORAGE_KEYS.CLIENTS, updatedClients);
      
      // Update analytics data
      saveAnalyticsData(updatedClients);
      
      return clients.length;
    } catch (error) {
      console.error("Error updating dashboard data:", error);
      throw new Error("Failed to update dashboard data");
    }
  };

  const handleImport = async () => {
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
      let importedClients: ImportedClient[] = [];
      
      // Parse file based on format
      if (format === 'csv') {
        importedClients = parseCSV(text);
      } else if (format === 'json') {
        importedClients = parseJSON(text);
      } else {
        throw new Error("Excel format is not supported yet. Please use CSV or JSON.");
      }
      
      if (importedClients.length === 0) {
        throw new Error("No valid client data found in the file.");
      }
      
      // Convert and validate each client
      const validatedClients = importedClients.map(validateClient);
      
      // Update dashboard data
      const count = updateDashboardData(validatedClients);
      setImportedCount(count);
      setSuccess(true);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${count} clients from ${fileName}.`,
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
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Import Client Data</DialogTitle>
        <DialogDescription>
          Upload a file to import client data into your dashboard.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="format">Format</Label>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant={format === "csv" ? "default" : "outline"}
              onClick={() => setFormat("csv")}
              className={format === "csv" ? "bg-red-600 hover:bg-red-700" : ""}
              size="sm"
            >
              CSV
            </Button>
            <Button 
              type="button" 
              variant={format === "json" ? "default" : "outline"}
              onClick={() => setFormat("json")}
              className={format === "json" ? "bg-red-600 hover:bg-red-700" : ""}
              size="sm"
            >
              JSON
            </Button>
            <Button 
              type="button" 
              variant={format === "xlsx" ? "default" : "outline"}
              onClick={() => setFormat("xlsx")}
              className={format === "xlsx" ? "bg-red-600 hover:bg-red-700" : ""}
              size="sm"
              disabled={true}
              title="Excel import coming soon"
            >
              Excel
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="file">File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={format === "csv" 
                ? ".csv" 
                : format === "json" 
                  ? ".json" 
                  : ".xlsx,.xls"}
              className={fileSelected ? "file:text-green-600" : ""}
            />
          </div>
          {fileName && (
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <FileUp className="h-3 w-3 mr-1" /> {fileName}
            </p>
          )}
          {error && (
            <ValidationError message={error} type="error" />
          )}
          {success && (
            <div className="bg-green-50 text-green-800 p-2 rounded-md flex items-start">
              <FileCheck className="h-4 w-4 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Import Successful!</p>
                <p className="text-xs">{importedCount} clients imported and metrics updated.</p>
              </div>
            </div>
          )}
        </div>
        <div className="bg-muted p-3 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium">File Format Requirements</p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1 space-y-1">
                <li>Include headers: name, status, progress, endDate</li>
                <li>Optional fields: csm, callsBooked, dealsClosed, mrr, npsScore</li>
                <li>Dates should be in YYYY-MM-DD format</li>
                <li>Valid status values: active, at-risk, churned, new, backend, olympia, paused, graduated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter className="sm:justify-between">
        {isLoading ? (
          <LoadingState message="Importing..." size="sm" />
        ) : (
          <>
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleImport}
              disabled={!fileSelected}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Import
            </Button>
          </>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
