
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, CheckCircle2 } from "lucide-react";

export type VerificationStatus = "pending" | "running" | "completed" | "failed";

interface VerificationCardProps {
  title: string;
  description: string;
  status: VerificationStatus;
  results: any[];
  issues: string[];
  actionButton?: React.ReactNode;
}

export function VerificationCard({
  title,
  description,
  status,
  results,
  issues,
  actionButton
}: VerificationCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <StatusBadge status={status} />
      </div>
      
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {status === "running" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Verifying...</span>
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      )}
      
      {status === "completed" && results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center">
                {!result.issues || result.issues.length === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                <span className="text-sm">
                  {result.component || result.cacheType || result.feature || result.system || result.route || ''}
                </span>
              </div>
              <Badge variant={(!result.issues || result.issues.length === 0) ? "success" : "destructive"}>
                {(!result.issues || result.issues.length === 0) ? 'Passed' : 'Issues'}
              </Badge>
            </div>
          ))}
        </div>
      )}
      
      {(status === "failed" || issues.length > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {issues.map((issue, index) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {actionButton && (
        <div className="flex justify-end">
          {actionButton}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  if (status === "pending") {
    return <Badge variant="outline">Pending</Badge>;
  }
  
  if (status === "running") {
    return (
      <Badge variant="outline" className="animate-pulse">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Running
      </Badge>
    );
  }
  
  if (status === "completed") {
    return (
      <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    );
  }
  
  if (status === "failed") {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  }
  
  return null;
}
