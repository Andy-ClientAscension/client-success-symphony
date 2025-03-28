
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/LoadingState";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileUp, AlertCircle } from "lucide-react";

type ImportFormat = "csv" | "json" | "xlsx";

interface ImportedClient {
  name: string;
  status: string;
  progress: number;
  endDate: string;
  csm?: string;
  callsBooked?: number;
  dealsClosed?: number;
  mrr?: number;
  npsScore?: number | null;
}

export function ImportData() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<ImportFormat>("csv");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(true);
      setFileName(file.name);
      setError(null);
      
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
    }
  };

  const handleImport = async () => {
    // For now, we'll simulate the import process
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // In a real implementation, we would parse the file and process the data
      // For this demo, we'll simulate a successful import

      const importedCount = Math.floor(Math.random() * 10) + 5; // Random number between 5-15
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} clients from ${fileName}.`,
      });
      
      // Reset the form and close the dialog
      setFileSelected(false);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
    } catch (err) {
      setError("Failed to import data. Please check your file format and try again.");
      console.error("Import error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Import client data from external sources</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" /> Import Clients
            </Button>
          </DialogTrigger>
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
                  >
                    CSV
                  </Button>
                  <Button 
                    type="button" 
                    variant={format === "json" ? "default" : "outline"}
                    onClick={() => setFormat("json")}
                    className={format === "json" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    JSON
                  </Button>
                  <Button 
                    type="button" 
                    variant={format === "xlsx" ? "default" : "outline"}
                    onClick={() => setFormat("xlsx")}
                    className={format === "xlsx" ? "bg-red-600 hover:bg-red-700" : ""}
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
                      <li>Status values: active, at-risk, churned, new</li>
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleImport}
                    disabled={!fileSelected}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Import
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
