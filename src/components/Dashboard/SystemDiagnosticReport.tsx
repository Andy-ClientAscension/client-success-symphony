
import { useState } from "react";
import { DiagnosticReport, DiagnosticResult, runComprehensiveDiagnostic } from "@/utils/diagnostics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function SystemDiagnosticReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const diagnosticReport = await runComprehensiveDiagnostic();
      setReport(diagnosticReport);
      
      if (diagnosticReport.status === 'critical') {
        toast({
          title: "Critical Issues Detected",
          description: `${diagnosticReport.summary.critical} critical issues require immediate attention.`,
          variant: "destructive",
        });
      } else if (diagnosticReport.status === 'warning') {
        toast({
          title: "Warnings Detected",
          description: `${diagnosticReport.summary.warnings} warnings should be addressed before publication.`,
          variant: "default",
        });
      } else {
        toast({
          title: "System Check Passed",
          description: "No issues detected. The system is ready for publication.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Diagnostic error:", error);
      toast({
        title: "Diagnostic Failed",
        description: "An error occurred while running the diagnostic.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Passed</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Warning</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Integrity':
        return <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>;
      case 'Configuration':
        return <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>;
      case 'API Integration':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'Performance':
        return <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>;
      case 'Client Health':
        return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      case 'Browser Compatibility':
        return <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>;
      case 'Storage':
        return <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>;
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          System Diagnostic
          {report && (
            <Badge 
              variant="outline" 
              className={`ml-2 ${
                report.status === 'passed' ? 'bg-green-50 text-green-700 border-green-200' : 
                report.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {report.status === 'passed' ? 'System Ready' : 
               report.status === 'warning' ? 'Action Needed' : 
               'Critical Issues'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Run a comprehensive diagnostic to verify the system is ready for publication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.summary.passed}</div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{report.summary.warnings}</div>
                <div className="text-sm text-gray-500">Warnings</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{report.summary.critical}</div>
                <div className="text-sm text-gray-500">Critical</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Diagnostic completed on {report.timestamp.toLocaleString()}
            </div>
            
            <Separator />
            
            {report.results.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {report.results.map((result, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="flex items-center">
                      <div className="flex items-center">
                        {getStatusIcon(result.status)}
                        <div className="flex items-center ml-2">
                          {getCategoryIcon(result.category)}
                          <span>{result.category}: {result.message}</span>
                        </div>
                      </div>
                      <div className="ml-auto mr-4">
                        {getStatusBadge(result.status)}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-3 space-y-2">
                        {result.details && (
                          <div>
                            <span className="font-medium">Details:</span> {result.details}
                          </div>
                        )}
                        {result.remediation && (
                          <div className="p-2 bg-blue-50 border border-blue-100 rounded-md mt-2">
                            <span className="font-medium text-blue-700">Recommended Action:</span> {result.remediation}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="p-6 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
                <p className="mt-2 text-gray-500">All checks passed successfully. The system is ready for publication.</p>
              </div>
            )}
          </div>
        )}
        
        {!report && !isLoading && (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">
              Run a comprehensive diagnostic scan to identify any issues that need to be addressed before publication.
            </p>
          </div>
        )}
        
        {isLoading && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-500">Running diagnostic tests...</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runDiagnostic} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostic...
            </>
          ) : report ? "Run Again" : "Run Diagnostic"}
        </Button>
      </CardFooter>
    </Card>
  );
}
